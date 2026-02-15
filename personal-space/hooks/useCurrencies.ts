import { useState, useEffect } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { CurrencyEntity } from "@/core/entities/CurrencyEntity";

export const useCurrencies = () => {
  const controller = useDependencies();

  const [currencies, setCurrencies] = useState<CurrencyEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const data = await controller.getAllCurrencies.execute();
      setCurrencies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, [controller.getAllCurrencies]);

  return {
    currencies,
    loading,
    refresh: fetchCurrencies,
  };
};
