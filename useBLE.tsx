/* eslint-disable no-bitwise */
import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
//Base-64 encoding is a way of taking binary data and turning it into text so that it's more easily transmitted in things like e-mail and HTML form data.
import { atob } from 'react-native-quick-base64';
const HEART_RATE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);

  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      // if (device?.name) {
      //   console.log('====================================');
      //   console.log('device: ', device?.name);
      //   console.log('====================================');
      // }
      if (device && device.name?.includes('Polar')) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  };


  // check revived data
  const onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ) => {
    // console.log('on heart rate update fired')
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was recieved');
      return -1;
    }

    const rawData = atob(characteristic.value);
    const ecgValues: number[] = [];

    for (let i = 0; i < rawData.length; i += 2) {
      const value = Number(rawData[i].charCodeAt(0) << 8) + Number(rawData[i + 1].charCodeAt(0));
      ecgValues.push(value);
    }

    console.log("ECG_Values: ", ecgValues);

    let innerHeartRate: number = -1;
    // console.log("characteristic ", characteristic);
    // console.log("rawData", rawData);

    //cal heart rate
    const firstBitValue: number = Number(rawData) & 0x01;

    if (firstBitValue === 0) {
      innerHeartRate = rawData[1].charCodeAt(0);
    } else {
      innerHeartRate =
        Number(rawData[1].charCodeAt(0) << 8) +
        Number(rawData[2].charCodeAt(2));
    }

    setHeartRate(innerHeartRate);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC,
        (error, characteristic) => onHeartRateUpdate(error, characteristic),
      );
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    heartRate,
  };
}

export default useBLE;


//  LOG  characteristic  {"_manager": {"_activePromises": {"6": [Function anonymous]}, "_activeSubscriptions": {"5": [Object]}, "_errorCodesToMessagesMapping": {"0": "Unknown error occurred. This is probably a bug! Check reason property.", "1": "BleManager was destroyed", "100": "BluetoothLE is unsupported on this device", "101": "Device is not authorized to use BluetoothLE", "102": "BluetoothLE is powered off", "103": "BluetoothLE is in unknown state", "104": "BluetoothLE is resetting", "105": "Bluetooth state change failed", "2": "Operation was cancelled", "200": "Device {deviceID} connection failed", "201": "Device {deviceID} was disconnected", "202": "RSSI read failed for device {deviceID}", "203": "Device {deviceID} is already connected", "204": "Device {deviceID} not found", "205": "Device {deviceID} is not connected", "206": "Device {deviceID} could not change MTU size", "3": "Operation timed out", "300": "Services discovery failed for device {deviceID}", "301": "Included services discovery failed for device {deviceID} and service: {serviceUUID}", "302": "Service {serviceUUID} for device {deviceID} not found", "303": "Services not discovered for device {deviceID}", "4": "Operation was rejected", "400": "Characteristic discovery failed for device {deviceID} and service {serviceUUID}", "401": "Characteristic {characteristicUUID} write failed for device {deviceID} and service {serviceUUID}", "402": "Characteristic {characteristicUUID} read failed for device {deviceID} and service {serviceUUID}", "403": "Characteristic {characteristicUUID} notify change failed for device {deviceID} and service {serviceUUID}", "404": "Characteristic {characteristicUUID} not found", "405": "Characteristics not discovered for device {deviceID} and service {serviceUUID}", "406": "Cannot write to characteristic {characteristicUUID} with invalid data format: {internalMessage}", "5": "Invalid UUIDs or IDs were passed: {internalMessage}", "500": "Descriptor {descriptorUUID} discovery failed for device {deviceID}, service {serviceUUID} and characteristic {characteristicUUID}", "501": "Descriptor {descriptorUUID} write failed for device {deviceID}, service {serviceUUID} and characteristic {characteristicUUID}", "502": "Descriptor {descriptorUUID} read failed for device {deviceID}, service {serviceUUID} and characteristic {characteristicUUID}", "503": "Descriptor {descriptorUUID} not found", "504": "Descriptors not discovered for device {deviceID}, service {serviceUUID} and characteristic {characteristicUUID}", "505": "Cannot write to descriptor {descriptorUUID} with invalid data format: {internalMessage}", "506": "Cannot write to descriptor {descriptorUUID}. It's not allowed by iOS and therefore forbidden on Android as well.", "600": "Cannot start scanning operation", "601": "Location services are disabled"}, "_eventEmitter": {}, "_scanEventSubscription": null, "_uniqueId": 6}, "deviceID": "E9:29:50:45:9E:BC", "id": 10, "isIndicatable": false, "isNotifiable": true, "isNotifying": true, "isReadable": false, "isWritableWithResponse": false, "isWritableWithoutResponse": false, "serviceID": 9, "serviceUUID": "0000180d-0000-1000-8000-00805f9b34fb", "uuid": "00002a37-0000-1000-8000-00805f9b34fb", "value": "EFSsAg=="}