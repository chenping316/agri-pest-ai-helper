
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
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
      // For now, we'll simulate results based on the query
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock search results based on the query
      const mockResults = Array.from({ length: 5 }, (_, i) => ({
        title: `${query} - 搜索结果 ${i + 1}`,
        link: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
        snippet: `这是关于"${query}"的模拟搜索结果摘要。在实际应用中，这里会显示真实的搜索结果片段，包含更多相关的防治方法和专业建议。`
      }));
      
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            "{query}" 的百度搜索结果
          </DialogTitle>
          <DialogDescription>
            以下是通过百度搜索引擎获取的相关内容
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
          <ScrollArea className="flex-1 max-h-[60vh] pr-4 -mr-4">
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-blue-600 hover:underline cursor-pointer"
                      onClick={() => openExternalLink(result.link)}>
                      <div className="flex items-center">
                        {result.title}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      {result.link}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm">{result.snippet}</p>
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
