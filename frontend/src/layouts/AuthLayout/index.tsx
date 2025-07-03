import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { resetStatusAndError } from "../../features/auth/authSlice";
import { useShowError } from "../../hooks/useShowError";
import { RootState } from "../../store";

function AuthLayout() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useShowError(auth.error);

  useEffect(() => {
    dispatch(resetStatusAndError());
  }, [location.pathname, dispatch]);

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
