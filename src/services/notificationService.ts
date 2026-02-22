import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const triggerIncomingCall = async (data: any) => {
    if (Platform.OS === 'ios') {
        await notifee.requestPermission();
    }

    const channelId = await notifee.createChannel({
        id: 'incoming-call',
        name: 'Incoming Calls',
        importance: AndroidImportance.HIGH,
        vibration: true,
    });

    await notifee.displayNotification({
        title: 'Incoming Call',
        body: data?.callerName ? `${data.callerName} is calling...` : 'Someone is calling...',
        data: data,
        android: {
            channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            autoCancel: false,
            ongoing: true,
            actions: [
                {
                    title: 'Decline',
                    pressAction: { id: 'decline' },
                },
                {
                    title: 'Accept',
                    pressAction: { id: 'accept', launchActivity: 'default' }, // Launch app to handle it
                },
            ],
        },
        ios: {
            categoryId: 'incoming-call',
            foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
            },
            interruptionLevel: 'critical',
        },
    });
};
export const setupNotificationInteractions = () => {
    if (Platform.OS === 'ios') {
        notifee.setNotificationCategories([
            {
                id: 'incoming-call',
                actions: [
                    {
                        id: 'decline',
                        title: 'Decline',
                        destructive: true,
                    },
                    {
                        id: 'accept',
                        title: 'Accept',
                        foreground: true,
                    },
                ],
            },
        ]);
    }

    return notifee.onForegroundEvent(({ type, detail }) => {
        switch (type) {
            case EventType.ACTION_PRESS:
                if (detail.pressAction?.id === 'accept') {
                    console.log('User accepted call in foreground', detail.notification?.data);
                    notifee.cancelNotification(detail.notification?.id || '');
                } else if (detail.pressAction?.id === 'decline') {
                    console.log('User declined call in foreground');
                    notifee.cancelNotification(detail.notification?.id || '');
                }
                break;
        }
    });
};

export const handleBackgroundMessages = () => {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'decline') {
            console.log('Call declined from background, dismissing');
            if (detail.notification?.id) {
                await notifee.cancelNotification(detail.notification?.id);
            }
        }
    });

    try {
        if (messaging().isDeviceRegisteredForRemoteMessages || messaging) {
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Message handled in the background!', remoteMessage);
                if (remoteMessage.data) {
                    await triggerIncomingCall(remoteMessage.data);
                }
            });
        }
    } catch (e) {
        console.warn('Firebase Messaging not configured natively. Skipping background handler.', e);
    }
};
