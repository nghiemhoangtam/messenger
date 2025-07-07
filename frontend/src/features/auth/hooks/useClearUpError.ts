import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetStatusAndError } from "../authSlice";

export function useClearUpError() {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(resetStatusAndError());
    };
  }, [dispatch]);
}
