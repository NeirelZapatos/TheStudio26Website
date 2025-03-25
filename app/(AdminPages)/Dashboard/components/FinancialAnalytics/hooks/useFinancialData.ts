import { useState, useEffect } from "react"; // Import React hooks

/**
 * useFinancialData Hook:
 * Manages fetching and formatting financial data, including revenue and category revenue.
 * Returns:
 * - financialData: Object containing revenue and category revenue data.
 * - selectedCategory: The currently selected product category.
 * - setSelectedCategory: Function to update the selected category.
 * - timeFrame: The currently selected time frame.
 * - setTimeFrame: Function to update the time frame.
 * - isLoading: Loading state.
 * - error: Error message (if any).
 * - startDate: Start date for date range filtering.
 * - setStartDate: Function to update the start date.
 * - endDate: End date for date range filtering.
 * - setEndDate: Function to update the end date.
 * - fetchDataByDateRange: Function to fetch data based on a date range.
 * - formatRevenue: Function to format revenue as currency.
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

interface CategorySales {
  [category: string]: {
    [month: string]: number;
  };
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

   const [categorySales, setCategorySales] = useState<CategorySales>({
    Jewelry: {},
    Stones: {},
    Supplies: {},
    Courses: {},
   })

  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [timeFrame, setTimeFrame] = useState<string>("Daily");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch financial data when the selected category or time frame changes
  useEffect(() => {
    const calculateDateRange = () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const currentDay = new Date().getDate();

      const nextDate = new Date(currentYear, currentMonth, currentDay);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextYear = nextDate.getFullYear();
      const nextMonth = (nextDate.getMonth() + 1).toString().padStart(2, "0");
      const nextDay = nextDate.getDate().toString().padStart(2, "0");

      let start = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${currentDay}`;
      let end = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${nextDay}`;

      if (timeFrame === "Yearly") {
        start = `${currentYear}-01-01`;
        end = `${currentYear}-12-31`;
      } else if (timeFrame === "Quarterly") {
        const quarterFirstMonth = Math.floor(currentMonth / 3) * 3;
        const quarterLastMonth = quarterFirstMonth + 2;
        start = `${currentYear}-${(quarterFirstMonth + 1).toString().padStart(2, "0")}-01`;
        end = `${currentYear}-${(quarterLastMonth + 1).toString().padStart(2, "0")}-${new Date(
          currentYear,
          quarterLastMonth + 1,
          0
        ).getDate()}`;
      } else if (timeFrame === "Monthly") {
        start = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`;
        end = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate().toString().padStart(2, "0")}`;
      } else {
        start = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${currentDay}`;
        end = `${nextYear}-${nextMonth}-${nextDay}`;
      }

      return { start, end };
    };

    const fetchData = async () => {
      const { start, end } = calculateDateRange();
      setStartDate(start);
      setEndDate(end);

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/financial-analytics/date-filter?category=${selectedCategory}&startDate=${start}&endDate=${end}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setFinancialData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

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

    const fetchCategorySales = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/category-sales-trend?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) throw new Error("Failed to fetch category sales");
        const data = await res.json();
        setCategorySales(data.categorySales);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchBestSellingItems();
    fetchCategorySales();
  }, [selectedCategory, timeFrame]);

  // Fetch financial data based on a custom date range
  const fetchDataByDateRange = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/financial-analytics/date-filter?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
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
  };

  // Format revenue as currency
  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return {
    financialData,
    bestSellingItems,
    categorySales,
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
    formatRevenue
  };
};

export default useFinancialData;