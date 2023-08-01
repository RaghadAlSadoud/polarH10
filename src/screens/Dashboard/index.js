// import { View, Text } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { Button } from 'native-base'
// import { useNavigation } from '@react-navigation/native'
// import { auth, db, getAuthState } from "../../../firebaseConfig";
// import { getDoc, doc } from "firebase/firestore";
// import { useAuthState } from "react-firebase-hooks/auth";


// const Dashboard = () => {
//   const navigation = useNavigation()
//   const [user, loading, error] = getAuthState();
//   // const [user, setUser] = useState({})

//   const getUser = async () => {
//     // console.log('user');
//     const docRef = doc(db, "users", user.uid);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       console.log("Document data:", docSnap.data());
//     } else {
//       // docSnap.data() will be undefined in this case
//       console.log("No such document!");
//     }
//   }

//   useEffect(() => {
//     // console.log('user');
//     getUser();
//   }, [])

//   return (
//     <View>
//       <Text>Dashboard</Text>
//       <Button onPress={() => navigation.goBack()}>Back</Button>

//     </View>
//   )
// }

// export default Dashboard

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { auth, db, getAuthState } from "../../../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import DeviceModal from '../../../DeviceConnectionModal';
// import PulseIndicator from './PulseIndicator';
import useBLE from '../../../useBLE';


const Dashboard = () => {
    const navigation = useNavigation()
  const [user, loading, error] = getAuthState();
  const [currUser, setCurrUser] = useState({})
  const [heartRateSession, setHeartRateSession] = useState([])

 
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // console.log('user');
    getUser();
  }, [])

  useEffect(() => {
    console.log(heartRate);
    setHeartRateSession(prevState => 
      [...prevState, heartRate]
    )
  }, [heartRate])

  const getUser = async () => {
    // console.log('user');
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setCurrUser(docSnap.data())
      console.log("Document data:", docSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const handleSaveResults = async () => {
    console.log(heartRateSession.filter((heartRate)=> heartRate !== 0))
    const sessionReadings = heartRateSession.filter((heartRate)=> heartRate !== 0)

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      sessionReadings
    });

  }
 
  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 20, padding: 6, textAlign: 'center'}}>Welcome {currUser.name}!</Text>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            {/* <PulseIndicator /> */}
            <Text style={styles.heartRateTitleText}>Your Heart Rate Is:</Text>
            <Text style={styles.heartRateText}>{heartRate} bpm</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Heart Rate Monitor
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSaveResults}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          SAVE SESSION RESULTS
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Dashboard;
