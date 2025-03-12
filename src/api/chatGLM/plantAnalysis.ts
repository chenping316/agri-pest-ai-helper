
import { DiagnosisResult, EnvData, Treatment } from "@/types";
import { callChatGLMApi } from "./client";

/**
 * 使用ChatGLM分析植物图像进行疾病诊断
 */
export async function analyzePlantDisease(
  imageBase64: string,
  plantType?: string,
  envData?: EnvData
): Promise<DiagnosisResult> {
  try {
    // 移除数据URL前缀（如果存在）
    const base64Image = imageBase64.includes("base64,") 
      ? imageBase64.split("base64,")[1] 
      : imageBase64;
    
    // 准备环境数据字符串
    let envDataString = "";
    if (envData) {
      envDataString = `
环境数据:
- 土壤湿度: ${envData.soilMoisture}%
- 土壤温度: ${envData.soilTemperature}°C
- 土壤pH值: ${envData.soilPh}
- 空气温度: ${envData.airTemperature}°C
- 空气湿度: ${envData.airHumidity}%`;
    }
    
    // 为模型创建提示
    const plantTypeInfo = plantType ? `植物类型: ${plantType}` : "植物类型: 未知";
    const userPrompt = `请分析这张植物图片，诊断可能的病害。
${plantTypeInfo}
${envDataString}

请按以下格式回复:
1. 病害名称
2. 病害描述(包括症状特征、发病规律和危害程度)
3. 置信度(0-1之间的数值)
4. 治疗方案(请为每种方法提供详细说明):
   - 方法名称
   - 具体实施步骤(至少3-5个步骤)
   - 所需材料/药剂及用量
   - 适用条件和最佳时机
   - 操作注意事项
   - 成本级别(低/中/高)
   - 有效性级别(低/中/高)
   - 估计价格
   - 预期效果`;

    // 调用API
    const apiResponse = await callChatGLMApi(
      userPrompt,
      base64Image,
      {
        temperature: 0.7,
        max_tokens: 2000
      }
    );
    
    // 提取文本响应
    const responseText = apiResponse.choices?.[0]?.message?.content || "";
    
    // 从原有的taichuVL分析模块中复用解析逻辑
    return parseResponseToResult(responseText, plantType);
  } catch (error) {
    console.error("Error calling ChatGLM API:", error);
    // 在API失败的情况下返回回退数据
    return createFallbackResult(plantType, true);
  }
}

/**
 * Parse the text response from the ChatGLM API into structured data
 * Reusing the parsing logic from taichuVL module
 */
function parseResponseToResult(responseText: string, plantType?: string): DiagnosisResult {
  try {
    // Extract disease name (typically after "病害名称:" or numbered as "1.")
    const nameMatch = responseText.match(/病害名称[:：]\s*(.+?)(?:\n|$)/) || 
                      responseText.match(/1\.\s*(.+?)(?:\n|$)/);
    const name = nameMatch ? nameMatch[1].trim() : "未知病害";
    
    // Extract description
    const descMatch = responseText.match(/病害描述[:：]\s*([\s\S]+?)(?=\n\d\.|\n置信度|\n治疗方案|$)/) ||
                      responseText.match(/2\.\s*([\s\S]+?)(?=\n\d\.|\n置信度|\n治疗方案|$)/);
    const description = descMatch ? descMatch[1].trim() : "无描述";
    
    // Extract confidence
    const confMatch = responseText.match(/置信度[:：]\s*(0\.\d+|1\.0|1)/) ||
                      responseText.match(/3\.\s*(0\.\d+|1\.0|1)/);
    const confidence = confMatch ? parseFloat(confMatch[1]) : 0.7;
    
    // Parse treatments
    const treatments = parseTreatments(responseText);
    
    return {
      name,
      description,
      confidence,
      treatments: treatments.slice(0, 4) // Limit to 4 treatments
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    return createFallbackResult(plantType);
  }
}

/**
 * Parse treatment information from the API response text
 */
function parseTreatments(responseText: string): Treatment[] {
  const treatments: Treatment[] = [];
  
  // Try to find treatment section
  const treatmentSection = responseText.match(/治疗方案[:：]\s*([\s\S]+)$/) ||
                          responseText.match(/4\.\s*([\s\S]+)$/) ||
                          responseText.match(/治疗方法[:：]\s*([\s\S]+)$/) ||
                          { index: responseText.indexOf("治疗"), 1: responseText.substring(responseText.indexOf("治疗")) };
  
  if (treatmentSection && treatmentSection[1]) {
    const treatmentText = treatmentSection[1];
    
    // 增强提取逻辑，捕获更详细的处理方法
    const methodMatches = treatmentText.match(/(\d+)[\.、]([^（(]*)[（(]([^)）]*)[)）]([^0-9\n]*)/g) ||
                         treatmentText.split(/\n\s*\n/);
    
    if (methodMatches && methodMatches.length > 0) {
      for (const methodMatch of methodMatches) {
        // 提取方法名称
        const methodNameMatch = methodMatch.match(/方法[:：]\s*(.+?)(?:\n|$)/) || 
                              { 1: methodMatch.includes("：") ? methodMatch.split("：")[0].trim() : methodMatch.split("\n")[0].trim() };
        
        // 提取成本和有效性
        const costMatch = methodMatch.match(/成本[:：]\s*(低|中|高)/) ||
                         methodMatch.match(/(低|中|高)\s*成本/);
        
        const effectMatch = methodMatch.match(/有效性[:：]\s*(低|中|高)/) ||
                           methodMatch.match(/(低|中|高)\s*有效/) ||
                           methodMatch.match(/效果[:：]\s*(低|中|高)/);
        
        const priceMatch = methodMatch.match(/价格[:：]\s*([^\/\n]+\/[^\n]+)/) ||
                          methodMatch.match(/([¥￥]\d+[\-～至]\d+\/[亩次株]+)/);
        
        // 提取详细描述，增强提取逻辑
        let detailedDesc = methodMatch;
        
        // 尝试提取步骤信息
        const stepsMatch = methodMatch.match(/步骤[:：]\s*([\s\S]+?)(?=\n\s*注意事项|\n\s*材料|\n\s*成本|$)/);
        const materialsMatch = methodMatch.match(/材料[:：]\s*([\s\S]+?)(?=\n\s*步骤|\n\s*注意事项|\n\s*成本|$)/);
        const cautionsMatch = methodMatch.match(/注意事项[:：]\s*([\s\S]+?)(?=\n\s*步骤|\n\s*材料|\n\s*成本|$)/);
        
        // 组合详细描述
        let enhancedDescription = "";
        
        if (stepsMatch && stepsMatch[1]) {
          enhancedDescription += "【操作步骤】" + stepsMatch[1].trim() + "\n\n";
        }
        
        if (materialsMatch && materialsMatch[1]) {
          enhancedDescription += "【所需材料】" + materialsMatch[1].trim() + "\n\n";
        }
        
        if (cautionsMatch && cautionsMatch[1]) {
          enhancedDescription += "【注意事项】" + cautionsMatch[1].trim() + "\n\n";
        }
        
        // 如果没有提取到结构化内容，则使用通用描述或尝试提取可能的描述
        if (!enhancedDescription) {
          const descMatch = methodMatch.match(/描述[:：]\s*(.+)/) ||
                          { 1: methodMatch.includes("：") && methodMatch.split("：").length > 1 ? 
                            methodMatch.split("：").slice(1).join("：").trim() : 
                            methodMatch.split("\n").slice(1).join("\n").trim() };
          
          enhancedDescription = descMatch[1] || "请按照专业农业技术指导使用该方法。";
        }
        
        treatments.push({
          method: methodNameMatch[1] || "处理方法",
          cost: (costMatch ? costMatch[1] : "medium") as "low" | "medium" | "high",
          effectiveness: (effectMatch ? effectMatch[1] : "medium") as "low" | "medium" | "high",
          estimatedPrice: priceMatch ? priceMatch[1] : "¥50-100/亩",
          description: enhancedDescription || "该方法需要按照农业专家指导进行实施，具体包括准备相关药剂、按照适当比例稀释、在合适的时间和天气条件下喷洒，并注意防护措施和操作安全。"
        });
        
        // Limit to 4 treatments
        if (treatments.length >= 4) break;
      }
    }
  }
  
  // 如果没有提取到足够的处理方法，添加默认方法
  addDefaultDetailedTreatments(treatments);
  
  return treatments;
}

/**
 * Add detailed default treatments if none were found or not enough
 */
function addDefaultDetailedTreatments(treatments: Treatment[]): void {
  // If no treatments found, add at least one generic treatment
  if (treatments.length === 0) {
    treatments.push({
      method: "喷洒杀菌剂",
      cost: "medium",
      effectiveness: "high",
      estimatedPrice: "¥40-60/亩",
      description: "【操作步骤】\n1. 选择合适的杀菌剂，如百菌清、甲基托布津等\n2. 按1:500-800的比例稀释药液\n3. 选择晴朗无风的上午9点至11点或下午4点后喷洒\n4. 确保均匀覆盖植物叶片正反面\n5. 每7-10天喷洒一次，连续2-3次\n\n【所需材料】\n- 杀菌剂（百菌清、甲基托布津等）\n- 喷雾器\n- 防护手套、口罩\n- 清水（稀释用）\n\n【注意事项】\n- 戴好防护装备避免药剂接触皮肤和眼睛\n- 避免在高温天气或雨前喷洒\n- 不同药剂不要混合使用以免发生化学反应\n- 注意遵守安全间隔期，避免在采收前短期内用药"
    });
  }
  
  // 确保我们有足够的处理方法以保持UI一致性
  const detailedMethods = [
    {
      method: "农业措施",
      description: "【操作步骤】\n1. 清除田间病株和杂草\n2. 调整种植密度，增加通风条件\n3. 合理轮作，避免连作\n4. 适当控制氮肥用量，增施钾肥\n5. 保持适宜的灌溉方式，避免浇水过多\n\n【所需材料】\n- 园艺剪刀（清除病株用）\n- 有机肥料\n- 钾肥\n- 合理的灌溉设备\n\n【注意事项】\n- 清除的病株应及时深埋或焚烧，不要堆放在田边\n- 避免在植株潮湿时进行操作\n- 保持工具清洁，操作不同植株时应消毒"
    },
    {
      method: "生物防治",
      description: "【操作步骤】\n1. 选择合适的生物制剂（如枯草芽孢杆菌、木霉菌等）\n2. 按说明书比例稀释或直接使用\n3. 在发病初期或预防阶段使用\n4. 喷施于整个植株表面，确保充分覆盖\n5. 根据季节和病情每7-14天使用一次\n\n【所需材料】\n- 生物制剂（枯草芽孢杆菌/木霉菌制剂）\n- 喷雾器\n- 清水（稀释用）\n\n【注意事项】\n- 生物制剂应储存在阴凉干燥处\n- 配制后应立即使用，不宜长时间存放\n- 避免与化学农药混用，间隔使用时间应大于7天\n- 效果较化学农药慢，应提前或初期使用"
    },
    {
      method: "抗病品种",
      description: "【操作步骤】\n1. 咨询当地农业技术部门了解适合本地的抗病品种\n2. 从正规渠道购买抗病品种种子或幼苗\n3. 按照品种特性选择合适的种植时间和方式\n4. 采用标准的栽培技术和田间管理\n5. 记录生长情况，评估抗病效果\n\n【所需材料】\n- 抗病品种种子/幼苗\n- 合适的栽培基质或土壤\n- 基础肥料\n\n【注意事项】\n- 抗病并不意味着完全免疫，仍需做好常规防护\n- 不同抗病品种对特定病害的抗性不同，选择时要针对性强\n- 种子处理和育苗环节尤为重要，应严格按技术要求操作"
    },
    {
      method: "物理防治",
      description: "【操作步骤】\n1. 修剪并清除已感染的枝叶和组织\n2. 使用消毒过的工具，避免交叉感染\n3. 对严重感染的植株实施隔离措施\n4. 使用适当的遮阳网调节光照强度\n5. 必要时使用杀菌灯或紫外线处理环境\n\n【所需材料】\n- 消毒剪刀或修枝工具\n- 75%酒精或消毒液\n- 垃圾袋（装病叶）\n- 遮阳网或防虫网\n\n【注意事项】\n- 修剪工具使用前后应消毒\n- 剪除的病叶病枝不可在田间随意丢弃\n- 操作时避免碰触健康植株部位\n- 大规模操作时应选择在晴天进行"
    }
  ];
  
  while (treatments.length < 4) {
    const template = detailedMethods[treatments.length % detailedMethods.length];
    treatments.push({
      method: template.method,
      cost: treatments.length % 3 === 0 ? "low" : treatments.length % 3 === 1 ? "medium" : "high",
      effectiveness: treatments.length % 3 === 0 ? "medium" : treatments.length % 3 === 1 ? "high" : "low",
      estimatedPrice: ["¥20-40/亩", "¥40-80/亩", "¥60-120/亩", "¥30-60/亩"][treatments.length % 4],
      description: template.description
    });
  }
}

/**
 * Create fallback diagnosis result if API call fails
 */
function createFallbackResult(plantType?: string, isFallback: boolean = false): DiagnosisResult {
  console.log("Using fallback diagnosis result for ChatGLM");
  
  // Similar to TaichuVL's fallback with an identifier for ChatGLM
  let diseaseName = isFallback ? "ChatGLM API连接错误 - 无法分析图片" : "叶斑病";
  let description = isFallback 
    ? "无法连接到ChatGLM API进行图片分析。请检查网络连接后重试，或尝试使用其他图片。以下是示例结果。" 
    : "叶斑病是一种常见的植物疾病，表现为叶片上出现不规则的褐色或黑色斑点。";
  
  if (plantType && !isFallback) {
    if (plantType.includes("水稻")) {
      diseaseName = "稻瘟病";
      description = "稻瘟病是由稻瘟病菌引起的一种常见的水稻疾病，表现为叶片上的褐色病斑和花颈部变黑。";
    } else if (plantType.includes("小麦")) {
      diseaseName = "小麦锈病";
      description = "小麦锈病是由真菌引起的植物病害，表现为叶片上出现橙黄色或褐色的粉状物。";
    } else if (plantType.includes("黄瓜") || plantType.includes("番茄") || plantType.includes("茄子")) {
      diseaseName = "霜霉病";
      description = "霜霉病是由真菌引起的疾病，在叶片表面形成白色或灰色的霉状物，严重时导致叶片枯死。";
    }
  }
  
  return {
    name: diseaseName,
    description: description,
    confidence: isFallback ? 0.01 : 0.7,
    treatments: [
      {
        method: isFallback ? "重试连接" : "喷洒杀菌剂",
        cost: "medium",
        effectiveness: "high",
        estimatedPrice: "¥40-60/亩",
        description: isFallback ? 
          "【操作步骤】\n1. 检查设备网络连接是否正常\n2. 确认API服务器状态\n3. 尝试清除应用缓存后重新启动\n4. 使用不同的网络环境重试\n5. 联系技术支持寻求帮助\n\n【注意事项】\n- 检查网络连接的稳定性\n- 确保图片大小适中，过大的图片可能导致上传失败" : 
          "【操作步骤】\n1. 选择合适的杀菌剂，如百菌清、甲基托布津等\n2. 按1:500-800的比例稀释药液\n3. 选择晴朗无风的上午9点至11点或下午4点后喷洒\n4. 确保均匀覆盖植物叶片正反面\n5. 每7-10天喷洒一次，连续2-3次\n\n【所需材料】\n- 杀菌剂（百菌清、甲基托布津等）\n- 喷雾器\n- 防护手套、口罩\n- 清水（稀释用）\n\n【注意事项】\n- 戴好防护装备避免药剂接触皮肤和眼睛\n- 避免在高温天气或雨前喷洒\n- 不同药剂不要混合使用以免发生化学反应"
      },
      {
        method: isFallback ? "检查API配置" : "农业措施",
        cost: "low",
        effectiveness: "medium",
        estimatedPrice: "¥0-20/亩",
        description: isFallback ? 
          "【操作步骤】\n1. 验证API密钥是否有效\n2. 检查API密钥ID是否正确配置\n3. 确认API请求格式是否符合最新规范\n4. 查看API调用限制是否已达上限\n5. 尝试重新生成新的API密钥\n\n【注意事项】\n- API密钥应妥善保存，避免泄露\n- 检查API密钥的有效期和权限设置" : 
          "【操作步骤】\n1. 清除田间病株和杂草\n2. 调整种植密度，增加通风条件\n3. 合理轮作，避免连作\n4. 适当控制氮肥用量，增施钾肥\n5. 保持适宜的灌溉方式，避免浇水过多\n\n【所需材料】\n- 园艺剪刀（清除病株用）\n- 有机肥料\n- 钾肥\n- 合理的灌溉设备\n\n【注意事项】\n- 清除的病株应及时深埋或焚烧，不要堆放在田边\n- 避免在植株潮湿时进行操作"
      },
      {
        method: isFallback ? "使用较小图片" : "生物防治",
        cost: "medium",
        effectiveness: "medium",
        estimatedPrice: "¥30-50/亩",
        description: isFallback ? 
          "【操作步骤】\n1. 压缩当前图片至小于2MB\n2. 降低图片分辨率到1080p或更低\n3. 裁剪图片去除无关区域，突出病害部位\n4. 尝试转换图片格式(如转为JPG)\n5. 使用不同的图片源重新拍摄\n\n【注意事项】\n- 压缩后的图片仍需保证病害特征清晰可见\n- 避免使用截图或二次处理的图片" : 
          "【操作步骤】\n1. 选择合适的生物制剂（如枯草芽孢杆菌、木霉菌等）\n2. 按说明书比例稀释或直接使用\n3. 在发病初期或预防阶段使用\n4. 喷施于整个植株表面，确保充分覆盖\n5. 根据季节和病情每7-14天使用一次\n\n【所需材料】\n- 生物制剂（枯草芽孢杆菌/木霉菌制剂）\n- 喷雾器\n- 清水（稀释用）\n\n【注意事项】\n- 生物制剂应储存在阴凉干燥处\n- 配制后应立即使用，不宜长时间存放"
      },
      {
        method: isFallback ? "重启应用" : "抗病品种",
        cost: "high",
        effectiveness: "high",
        estimatedPrice: "¥50-80/亩",
        description: isFallback ? 
          "【操作步骤】\n1. 完全关闭应用（从后台清除）\n2. 重启设备以释放内存和资源\n3. 确保设备有充足的存储空间\n4. 重新打开应用并登录\n5. 再次尝试上传图片分析\n\n【注意事项】\n- 如果问题持续，考虑卸载并重新安装应用\n- 更新至最新版本可能会解决兼容性问题" : 
          "【操作步骤】\n1. 咨询当地农业技术部门了解适合本地的抗病品种\n2. 从正规渠道购买抗病品种种子或幼苗\n3. 按照品种特性选择合适的种植时间和方式\n4. 采用标准的栽培技术和田间管理\n5. 记录生长情况，评估抗病效果\n\n【所需材料】\n- 抗病品种种子/幼苗\n- 合适的栽培基质或土壤\n- 基础肥料\n\n【注意事项】\n- 抗病并不意味着完全免疫，仍需做好常规防护\n- 不同抗病品种对特定病害的抗性不同"
      }
    ]
  };
}
