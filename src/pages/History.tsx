
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Clock, Filter, Search } from "lucide-react";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HistoryItem from "@/components/HistoryItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const History: React.FC = () => {
  const { isLoggedIn, history } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterMode, setFilterMode] = useState<"all" | "image-only" | "image-and-env">("all");

  const filteredHistory = history.filter(record => {
    // Apply search filter
    const matchesSearch = record.diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply mode filter
    const matchesMode = 
      filterMode === "all" || 
      (filterMode === "image-only" && !record.envData) ||
      (filterMode === "image-and-env" && record.envData);
    
    return matchesSearch && matchesMode;
  });

  // Sort records
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
  });

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">历史记录</h1>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索病虫害名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={filterMode}
                  onValueChange={(value) => setFilterMode(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="筛选模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部记录</SelectItem>
                    <SelectItem value="image-only">仅图片分析</SelectItem>
                    <SelectItem value="image-and-env">图片+环境分析</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as any)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">最新优先</SelectItem>
                    <SelectItem value="oldest">最早优先</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {sortedHistory.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedHistory.map((record) => (
                <HistoryItem key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              {history.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">没有找到符合条件的记录</p>
                  <Button variant="outline" onClick={() => { 
                    setSearchTerm(""); 
                    setFilterMode("all");
                  }}>
                    清除筛选条件
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">暂无分析记录</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    开始分析植物病虫害，记录将自动保存在这里
                  </p>
                  <Button onClick={() => window.location.href = "/analysis"}>
                    开始首次分析
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
