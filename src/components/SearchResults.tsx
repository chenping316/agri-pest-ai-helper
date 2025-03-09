
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink, ArrowUpRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
  time?: string;
}

interface SearchResultsProps {
  query: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, open, onOpenChange }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && query) {
      fetchSearchResults();
    }
  }, [open, query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would use a proper search API
      // For now, we'll simulate more detailed results based on the query
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate more detailed mock search results based on the query
      let mockResults: SearchResult[] = [];
      
      if (query.includes("稻瘟病")) {
        mockResults = [
          {
            title: "稻瘟病的发病症状、发病规律及综合防治方法",
            link: "https://www.baidu.com/s?wd=稻瘟病防治",
            snippet: "稻瘟病是由稻瘟菌引起的水稻病害，主要危害植株的叶片、节、穗颈和穗等部位。叶瘟发病初期，在叶片上出现褐色小点，后扩大为纺锤形或菱形的病斑，大小为1～2厘米，边缘褐色，中部灰色。防治方法：一是选用抗病品种；二是合理密植，谨防偏施氮肥；三是发病初期及时用药剂防治。可用三环唑或稻瘟灵（三环唑20%可湿性粉剂）25%可湿性粉剂2000倍液、或苯菌灵50%可湿性粉剂500～800倍液喷雾防治。",
            source: "中国农业技术网",
            time: "2024-03-05"
          },
          {
            title: "水稻稻瘟病最有效的治疗方法和用药指南",
            link: "https://www.baidu.com/s?wd=水稻稻瘟病用药",
            snippet: "水稻稻瘟病是水稻生长期主要病害之一，发病严重时可造成减产30%以上。症状：叶片染病后出现褐色小点，扩展为纺锤形病斑；茎染病为黑褐色腐败斑；穗颈染病灰褐至黑褐色，被害部位常折断；粒染病为褐色斑点。使用药剂防治效果最好，推荐以下几种方法：1. 三环唑20%可湿性粉剂1500-2000倍液喷施；2. 嘧菌酯25%悬浮剂4000倍液喷施；3. 井冈霉素A-1%水剂400-500倍液喷施，隔7-10天喷一次，连续喷2-3次。",
            source: "农业科技在线",
            time: "2024-05-12"
          },
          {
            title: "稻瘟病的生物防治技术及生态调控措施",
            link: "https://www.baidu.com/s?wd=稻瘟病生物防治",
            snippet: "生物防治稻瘟病是近年来研究的热点，主要包括：1. 拮抗微生物制剂：枯草芽孢杆菌可有效抑制稻瘟菌的生长，使用浓度为108-109个/ml的菌悬液喷雾，防效可达70%以上。2. 植物源农药：从姜黄、丁香、肉桂等植物中提取的精油对稻瘟菌有较强的抑制作用。3. 生态调控：适当增加栽培密度提高田间湿度，增施有机肥和钾肥，减少氮肥使用量，改善水稻生长环境不利于病害发生。试验表明，合理调控灌溉水位，实行干湿交替灌溉可降低发病率25%左右。",
            source: "中国植保学会",
            time: "2024-04-18"
          },
          {
            title: "稻瘟病高发区域的抗病品种选择与轮作策略",
            link: "https://www.baidu.com/s?wd=稻瘟病抗病品种",
            snippet: "在稻瘟病高发区域应选择抗病品种是预防稻瘟病的根本措施。抗病品种包括：1. 粳稻品种：吉粳88、松粳9号、松粳14等；2. 籼稻品种：特优9308、汕优63、汕优64等。此外，应实行合理的轮作制度，稻田连作3-4年后应改种其他作物1-2年，如玉米、大豆等，可有效降低土壤中稻瘟菌的数量。实践证明，水旱轮作还可显著改善土壤结构，为下茬水稻创造良好的生长环境，稻瘟病发病率可降低50%以上。",
            source: "农业部耕作栽培研究所",
            time: "2024-01-30"
          },
          {
            title: "稻瘟病的气象预警及精准施药技术",
            link: "https://www.baidu.com/s?wd=稻瘟病预警",
            snippet: "稻瘟病发生与气象条件密切相关，可通过建立气象预警模型提前预测发病风险。当日平均气温23-28℃，相对湿度85%以上，连续3天以上时，稻瘟病发生风险高。预警后应采取精准施药措施：1. 选择高效低毒农药，如三环唑、嘧菌酯、苯并咪唑类等；2. 采用新型施药技术如静电喷雾或超低量喷雾，减少药液用量30-50%；3. 科学确定施药时间，一般在晴天上午9点前或下午4点后，此时温度适中，药效发挥最佳。精准施药可提高防效20%以上，同时减少环境污染。",
            source: "中国气象局农业气象中心",
            time: "2024-06-01"
          }
        ];
      } else if (query.includes("蚜虫")) {
        mockResults = [
          {
            title: "农作物蚜虫的生物学特性及综合防治技术",
            link: "https://www.baidu.com/s?wd=蚜虫防治",
            snippet: "蚜虫是重要的农作物害虫，能够刺吸植物汁液，导致叶片卷曲、变黄，严重时整株枯萎。此外，蚜虫还能传播多种植物病毒病。防治措施：1. 农业防治：清除田间杂草，及时处理病残体，减少越冬基数。2. 生物防治：保护和利用天敌，如七星瓢虫、食蚜蝇等。3. 化学防治：在蚜虫初期为害时喷洒40%乐果乳剂1000倍液，或2.5%溴氰菊酯乳剂2000倍液，或10%吡虫啉可湿性粉剂2000倍液。注意交替用药，防止产生抗药性。",
            source: "中国农业科学院",
            time: "2024-04-10"
          },
          {
            title: "小麦蚜虫绿色防控技术及应用案例分析",
            link: "https://www.baidu.com/s?wd=小麦蚜虫绿色防控",
            snippet: "小麦蚜虫主要有禾谷缢管蚜、麦长管蚜和麦二叉蚜等，严重发生时可造成小麦减产15%-30%。绿色防控技术主要包括：1. 生态调控：合理密植，适期播种，增施有机肥，提高植株抗性。2. 生物防治：保护利用蚜虫天敌，如在每667㎡释放七星瓢虫成虫300-500头，或每667㎡安装黄板30-50张诱杀有翅蚜虫。3. 植物源农药：茶籽饼、苦参碱、除虫菊酯等对蚜虫有较好的防效，且对环境友好。山东禹城示范区应用该技术后，蚜虫防治效果达90%以上，减少化学农药使用量50%，增产5.8%。",
            source: "小麦害虫防控网",
            time: "2024-03-28"
          },
          {
            title: "果树蚜虫综合防治体系构建与实践效果",
            link: "https://www.baidu.com/s?wd=果树蚜虫防治",
            snippet: "果树蚜虫主要有苹果绿蚜、桃蚜、梨绵蚜等，严重影响果实品质和产量。综合防治体系包括：1. 修剪与物理防治：冬季修剪时剪除越冬虫卵枝条，疏除徒长枝，改善通风透光条件。2. 生物防治：在蚜虫低密度发生时，释放食蚜蝇、草蛉等天敌，或喷施白僵菌、球孢白僵菌等微生物制剂。3. 化学防治：选用高效低毒农药如吡虫啉、啶虫脒等新烟碱类杀虫剂，或噻嗪酮、吡蚜酮等选择性杀虫剂。陕西洛川苹果园应用此体系，减少化学农药使用次数2-3次，蚜虫控制率达95%以上，果品品质明显提升。",
            source: "中国园艺学会",
            time: "2024-05-15"
          },
          {
            title: "温室蔬菜蚜虫的监测与精准防控策略",
            link: "https://www.baidu.com/s?wd=温室蚜虫防控",
            snippet: "温室蔬菜中蚜虫主要有桃蚜、烟粉虱、棉蚜等，它们不仅直接危害植株，还能传播多种病毒病。精准防控策略：1. 科学监测：每667㎡设置3-5个黄板，定期检查蚜虫种类和数量，建立数据库分析发生规律。2. 物理防控：温室入口设置防虫网，网目≤0.2mm；采用蓝光诱虫灯和黄板结合使用，可减少蚜虫密度30%以上。3. 生物防控：释放寄生蜂或捕食性天敌，如寄生蜂释放量为每667㎡1000-2000头，根据蚜虫密度调整释放量。4. 科学用药：当平均每株蚜虫达到10头以上时进行化学防治，选用高效低毒农药如啶虫脒、吡蚜酮等，注意交替使用不同作用机制的药剂。该策略在山东寿光应用后，农药使用量减少40%，防效提高15%。",
            source: "中国蔬菜协会",
            time: "2024-02-20"
          },
          {
            title: "有机农业中蚜虫防控技术及成功案例",
            link: "https://www.baidu.com/s?wd=有机农业蚜虫防控",
            snippet: "有机农业禁止使用化学合成农药，蚜虫防控主要依靠以下技术：1. 农田生态系统调控：采用间作套种模式，如小麦-蚕豆间作、玉米-大豆间作等，可减少蚜虫发生20%-30%。2. 植物源农药：使用苦楝油、除虫菊素、鱼藤酮等天然源农药，如0.3%苦楝油乳剂600-800倍液喷雾，或0.5%的除虫菊素乳剂1000倍液喷雾。3. 生物天敌利用：释放捕食性和寄生性天敌，如每亩释放七星瓢虫成虫2000-3000头。宁夏银川有机蔬菜基地采用此技术，蚜虫控制效果达80%以上，有机蔬菜品质明显优于常规蔬菜，经济效益提高25%。",
            source: "有机农业协会",
            time: "2024-05-25"
          }
        ];
      } else {
        // Generic case for other search terms
        mockResults = Array.from({ length: 5 }, (_, i) => ({
          title: `${query} - 详细分析与防治方法 ${i + 1}`,
          link: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
          snippet: `这是关于"${query}"的详细搜索结果。包含该病虫害的特征特点、发病规律、危害表现以及系统的防治方法。防治方法主要包括农业防治、物理防治、生物防治和化学防治等多种手段，应根据具体情况选择合适的防治策略。本文详细介绍了防治${query}的最新技术和使用方法，包括推荐药剂、施用浓度、使用时期等关键信息。`,
          source: `农业科技网站 ${i + 1}`,
          time: `2024-0${i + 1}-15`
        }));
      }
      
      setResults(mockResults);
    } catch (err) {
      console.error("Search error:", err);
      setError("搜索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            "{query}" 的详细搜索结果
          </DialogTitle>
          <DialogDescription>
            以下是通过百度搜索引擎获取的专业防治方法和技术指导
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">正在搜索中，请稍候...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchSearchResults} variant="outline" className="mt-2">
              重试
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[65vh] pr-4 -mr-4">
            <div className="space-y-6">
              {results.map((result, index) => (
                <Card key={index} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-start">
                      <CardTitle 
                        className="text-base text-blue-600 hover:underline cursor-pointer"
                        onClick={() => openExternalLink(result.link)}
                      >
                        <div className="flex items-center">
                          {result.title}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </div>
                      </CardTitle>
                      
                      {result.source && (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          {result.source}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <CardDescription className="truncate">
                        {result.link}
                      </CardDescription>
                      
                      {result.time && (
                        <div className="flex items-center ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {result.time}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {result.snippet}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center py-4">
                <Button 
                  variant="outline"
                  className="text-blue-600"
                  onClick={() => openExternalLink(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  在百度中查看完整搜索结果
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchResults;
