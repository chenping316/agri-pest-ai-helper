
import React, { useState } from "react";
import { Check, ChevronsUpDown, Leaf, Search } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PlantTypeSelector: React.FC = () => {
  const { selectedPlantType, setSelectedPlantType, availablePlantTypes } = useAppContext();
  const [open, setOpen] = useState(false);
  const [customPlantType, setCustomPlantType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedPlantName = selectedPlantType 
    ? availablePlantTypes.find(pt => pt.id === selectedPlantType)?.name || selectedPlantType
    : "";

  const handleSelectPlantType = (value: string) => {
    if (value === "custom") {
      setShowCustomInput(true);
      setOpen(false);
      return;
    }
    
    setSelectedPlantType(value);
    setOpen(false);
  };

  const handleCustomPlantTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPlantType.trim()) {
      setSelectedPlantType(customPlantType.trim());
      setCustomPlantType("");
      setShowCustomInput(false);
    }
  };

  const handleClearCustomInput = () => {
    setShowCustomInput(false);
    setCustomPlantType("");
  };

  // Group plant types by category
  const categories = Array.from(new Set(availablePlantTypes.map(type => type.category)));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">植物种类</h3>
      
      {showCustomInput ? (
        <form onSubmit={handleCustomPlantTypeSubmit} className="flex gap-2">
          <Input
            value={customPlantType}
            onChange={(e) => setCustomPlantType(e.target.value)}
            placeholder="输入植物种类名称"
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="sm">确定</Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClearCustomInput}>取消</Button>
        </form>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedPlantType ? (
                <span className="flex items-center">
                  <Leaf className="mr-2 h-4 w-4 text-primary" />
                  {selectedPlantName}
                </span>
              ) : (
                <span className="text-muted-foreground">选择植物种类</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]">
            <Command>
              <CommandInput placeholder="搜索植物种类..." />
              <CommandList>
                <CommandEmpty>未找到植物种类</CommandEmpty>
                <ScrollArea className="h-[300px]">
                  {categories.map(category => {
                    const categoryItems = availablePlantTypes.filter(type => type.category === category);
                    
                    if (categoryItems.length === 0) return null;
                    
                    return (
                      <CommandGroup key={`category-${category}`} heading={category}>
                        {categoryItems.map(type => (
                          <CommandItem
                            key={type.id}
                            value={type.id}
                            onSelect={handleSelectPlantType}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPlantType === type.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                  <CommandGroup heading="其他">
                    <CommandItem value="custom" onSelect={() => handleSelectPlantType("custom")}>
                      <Search className="mr-2 h-4 w-4" />
                      输入自定义植物种类
                    </CommandItem>
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default PlantTypeSelector;
