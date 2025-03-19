import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
    loginRequest,
    logoutRequest,
    registerRequest,
    socialAuthRequest,
} from '../authSlice';
import { LoginCredentials, RegisterCredentials, SocialAuthCredentials } from '../types';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const login = useCallback(
        (credentials: LoginCredentials) => {
            dispatch(loginRequest(credentials));
        },
        [dispatch]
    );

    const register = useCallback(
        (credentials: RegisterCredentials) => {
            dispatch(registerRequest(credentials));
        },
        [dispatch]
    );

    const socialAuth = useCallback(
        (credentials: SocialAuthCredentials) => {
            dispatch(socialAuthRequest(credentials));
        },
        [dispatch]
    );

    const logout = useCallback(() => {
        dispatch(logoutRequest());
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        socialAuth,
        logout,
    };
}; 