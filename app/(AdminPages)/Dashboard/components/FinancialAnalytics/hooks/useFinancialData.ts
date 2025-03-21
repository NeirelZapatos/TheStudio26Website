import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to fetch and manage financial data.
 */
interface CategoryRevenue {
  revenue: number;
}

interface FinancialData {
  revenue: number;
  categoryRevenue: Record<string, CategoryRevenue>;
}

interface BestSellingItem {
  name: string;
  sales: number;
}

interface BestSellingItems {
  Jewelry: BestSellingItem[];
  Stones: BestSellingItem[];
  Supplies: BestSellingItem[];
  Courses: BestSellingItem[];
}

const useFinancialData = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: 0,
    categoryRevenue: {},
  });

  const [bestSellingItems, setBestSellingItems] = useState<BestSellingItems>({
    Jewelry: [],
    Stones: [],
    Supplies: [],
    Courses: [],
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [timeFrame, setTimeFrame] = useState<string>("Daily");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  /**
   * Calculate the date range based on the selected time frame.
   */
  const calculateDateRange = useCallback(() => {
    const today = new Date();
    let start: string, end: string;
  
    switch (timeFrame) {
      case "Yearly":
        start = `${today.getFullYear()}-01-01`; // Start of the year
        end = `${today.getFullYear()}-12-31`; // End of the year
        break;
  
      case "Quarterly":
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3; // Get first month of the quarter
        const quarterEndMonth = quarterStartMonth + 2; // Get last month of the quarter
        start = `${today.getFullYear()}-${(quarterStartMonth + 1).toString().padStart(2, "0")}-01`;
        end = `${today.getFullYear()}-${(quarterEndMonth + 1).toString().padStart(2, "0")}-${new Date(today.getFullYear(), quarterEndMonth + 1, 0).getDate()}`;
        break;
  
      case "Monthly":
        start = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;
        end = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}`;
        break;
  
      default:
        // "Daily" - Use today's date
        start = end = today.toISOString().split("T")[0];
    }
  
    console.log(`🟢 TimeFrame: ${timeFrame}, Start Date: ${start}, End Date: ${end}`);
    setStartDate(start);
    setEndDate(end);
  }, [timeFrame]);  

  /**
   * Fetch financial data based on category and date range.
   */
  /*
  const fetchFinancialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/financial-analytics?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setFinancialData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, startDate, endDate]);

  useEffect(() => {
    calculateDateRange(); 
  }, [timeFrame, calculateDateRange]);

    const fetchBestSellingItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/best-selling-items?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) throw new Error("Failed to fetch best-selling items");
        const data = await response.json();
        setBestSellingItems(data.bestSellingItems);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchBestSellingItems();
  }, [selectedCategory, timeFrame]);

  const fetchDataByDateRange = useCallback(async () => {
    setIsLoading(true);
    setError(null);
  
    console.log(`📡 Fetching Data:`, {
      category: selectedCategory,
      timeFrame,
      startDate,
      endDate,
    });
  
    try {
      const response = await fetch(
        `/api/financial-analytics/date-filter?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`
      );
  
      if (!response.ok) throw new Error("Failed to fetch data");
  
      const data = await response.json();
      console.log("📊 API Response:", data);
  
      setFinancialData(data);

      const bestSellingResponse = await fetch(`/api/best-selling-items?startDate=${startDate}&endDate=${endDate}`);
      if (!bestSellingResponse.ok) throw new Error("Failed to fetch best-selling items");
      const bestSellingData = await bestSellingResponse.json();
      setBestSellingItems(bestSellingData.bestSellingItems);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, startDate, endDate]);
      

  return {
    financialData,
    bestSellingItems,
    selectedCategory,
    setSelectedCategory,
    timeFrame,
    setTimeFrame,
    isLoading,
    error,
    startDate, 
    setStartDate,
    endDate, 
    setEndDate,
    fetchDataByDateRange, 
    formatRevenue: (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value),
  };
};

export default useFinancialData;