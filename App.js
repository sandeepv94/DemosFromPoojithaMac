/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { SafeAreaView, StyleSheet, View, Text, StatusBar} from 'react-native';

import VoipPushNotification from 'react-native-voip-push-notification';

// const App: () => React$Node = () => {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <View style= {{top: 50, left: 30}}> 
//         <Text style= {{fontSize:18}}> React native app </Text>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// };

class App extends Component {
  componentWillMount() { // or anywhere which is most comfortable and appropriate for you
    VoipPushNotification.requestPermissions(); // --- optional, you can use another library to request permissions
    VoipPushNotification.registerVoipToken(); // --- required
    console.log('entered till here')
    VoipPushNotification.addEventListener('register', (token) => {
      // send token to your apn provider server
      console.log('token is :', token)
    });
 
    VoipPushNotification.addEventListener('notification', (notification) => {
      // register your VoIP client, show local notification, etc.
      // e.g.
      // this.doRegister();
      console.log('notification is: ', notification)
      
      /* there is a boolean constant exported by this module called
       * 
       * wakeupByPush
       * 
       * you can use this constant to distinguish the app is launched
       * by VoIP push notification or not
       *
       * e.g.
       */
       if (VoipPushNotification.wakeupByPush) {
         // do something...
         console.log('wakeupbypush *********')
 
         // remember to set this static variable to false
         // since the constant are exported only at initialization time
         // and it will keep the same in the whole app
         VoipPushNotification.wakeupByPush = false;

       }
 
      /**
       * Local Notification Payload
       *
       * - `alertBody` : The message displayed in the notification alert.
       * - `alertAction` : The "action" displayed beneath an actionable notification. Defaults to "view";
       * - `soundName` : The sound played when the notification is fired (optional).
       * - `category`  : The category of this notification, required for actionable notifications (optional).
       * - `userInfo`  : An optional object containing additional notification data.
       */
      VoipPushNotification.presentLocalNotification({
        alertBody: "hello! your message triggered " + notification.getMessage()
          
      });
    });
  }

  render() {
    return (
      <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style= {{top: 50, left: 30}}> 
        <Text style= {{fontSize:18}}> React native app </Text>
        </View>
      </SafeAreaView>
    </>
    );
  }
}
export default App;







