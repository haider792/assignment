import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import CallScreen from './src/screens/CallScreen';
import { setupNotificationInteractions } from './src/services/notificationService';

const App = () => {
  useEffect(() => {
    const unsubscribeNotifee = setupNotificationInteractions();

    return () => {
      if (unsubscribeNotifee) {
        unsubscribeNotifee();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CallScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  }
});

export default App;
