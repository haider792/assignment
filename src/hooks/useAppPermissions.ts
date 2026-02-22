import { useState, useCallback, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';

export type AppPermissionState = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'idle';

export const useAppPermissions = () => {
    const [cameraStatus, setCameraStatus] = useState<AppPermissionState>('idle');
    const [micStatus, setMicStatus] = useState<AppPermissionState>('idle');

    const getCameraPermission = () => Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const getMicPermission = () => Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const mapResultToState = (result: PermissionStatus): AppPermissionState => {
        switch (result) {
            case RESULTS.GRANTED: return 'granted';
            case RESULTS.DENIED: return 'denied';
            case RESULTS.BLOCKED: return 'blocked';
            case RESULTS.UNAVAILABLE: return 'unavailable';
            default: return 'idle';
        }
    };

    const checkPermissions = useCallback(async () => {
        try {
            const camStat = await check(getCameraPermission());
            const micStat = await check(getMicPermission());

            setCameraStatus(mapResultToState(camStat));
            setMicStatus(mapResultToState(micStat));
        } catch (e) {
            console.error('Error checking permissions:', e);
        }
    }, []);

    const requestPermissions = useCallback(async () => {
        try {
            const camResult = await request(getCameraPermission());
            setCameraStatus(mapResultToState(camResult));

            const micResult = await request(getMicPermission());
            setMicStatus(mapResultToState(micResult));

            return {
                camera: mapResultToState(camResult),
                mic: mapResultToState(micResult)
            };
        } catch (e) {
            console.error('Error requesting permissions:', e);
            return { camera: 'denied', mic: 'denied' }; // Fallback, never crash
        }
    }, []);

    const openSettings = useCallback(() => {
        Linking.openSettings().catch(() => console.error("Cannot open settings"));
    }, []);

    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    const isAllGranted = cameraStatus === 'granted' && micStatus === 'granted';
    const isAnyBlocked = cameraStatus === 'blocked' || micStatus === 'blocked';

    return {
        cameraStatus,
        micStatus,
        isAllGranted,
        isAnyBlocked,
        requestPermissions,
        checkPermissions,
        openSettings,
    };
};
