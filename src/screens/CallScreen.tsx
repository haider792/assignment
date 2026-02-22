import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, mediaDevices, MediaStream } from 'react-native-webrtc';
import { useAppPermissions } from '../hooks/useAppPermissions';

const CallScreen = () => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    const { isAllGranted, isAnyBlocked, requestPermissions, openSettings } = useAppPermissions();

    useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const startStream = async () => {
            if (!isAllGranted) {
                await requestPermissions();
            }

            if (isAllGranted) {
                try {
                    const mediaStream = await mediaDevices.getUserMedia({
                        audio: true,
                        video: {
                            width: 1280,
                            height: 720,
                            frameRate: 30,
                            facingMode: isFrontCamera ? 'user' : 'environment',
                            deviceId: '',
                        },
                    });

                    if (isMounted) {
                        setLocalStream(mediaStream as unknown as MediaStream);
                        stream = mediaStream as unknown as MediaStream;
                    } else {
                        mediaStream.getTracks().forEach(track => track.stop());
                    }
                } catch (err) {
                    console.error('Failed to get local stream', err);
                }
            }
        };

        startStream();

        return () => {
            isMounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream.release();
                setLocalStream(null);
            }
        };
    }, [isAllGranted, requestPermissions]);

    const toggleMute = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setIsMuted(!audioTracks[0].enabled);
            }
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                // This type assertion avoids type error for _switchCamera method exposed in 'react-native-webrtc'
                if (typeof (track as any)._switchCamera === 'function') {
                    (track as any)._switchCamera();
                    setIsFrontCamera(!isFrontCamera);
                }
            });
        }
    };

    if (isAnyBlocked) {
        return (
            <View style={styles.centerItem}>
                <Text style={styles.alertText}>Camera or Microphone permission is blocked.</Text>
                <TouchableOpacity style={styles.settingsBtn} onPress={openSettings}>
                    <Text style={styles.textBtn}>Open System Settings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Permission not granted yet but not blocked
    if (!isAllGranted) {
        return (
            <View style={styles.centerItem}>
                <Text style={styles.alertText}>Requesting permissions...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.videoContainer}>
                {localStream ? (
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={styles.videoPlayer}
                        objectFit="cover"
                        zOrder={1}
                    />
                ) : (
                    <View style={styles.centerItem}>
                        <Text style={styles.alertText}>Initializing Camera...</Text>
                    </View>
                )}
            </View>

            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
                    <Text style={styles.textBtn}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
                    <Text style={styles.textBtn}>Toggle Camera</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CallScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    videoContainer: {
        flex: 1,
    },
    videoPlayer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 10,
        zIndex: 2,
    },
    controlBtn: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBtn: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    centerItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    alertText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 20,
    },
    settingsBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    }
});
