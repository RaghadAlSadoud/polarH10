// import { View, Text } from 'react-native'
import React,{useState} from 'react'
import {Alert} from 'react-native'
import {Button, Input, VStack, HStack, Box, Icon, Text} from 'native-base'
import {Icon as Icons} from '@rneui/base'
import {useNavigation} from '@react-navigation/native'
import { auth, db } from "../../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { updateProfile, getAuth } from "firebase/auth";

const SignUp = () => {
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const emptyState = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      if (password !== confirmPassword)
        return alert("Password does not match.");

      let userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).catch((error) => {
        setLoading(false);
        switch (error.code) {
          case "auth/invalid-email": {
            Alert.alert("Invalid email!");
            break;
          }
          case "auth/user-disabled": {
            Alert.alert("This user has been disabled!");
            break;
          }
          case "auth/user-not-found": {
            Alert.alert("This user doesn't exist");
            break;
          }
          case "auth/wrong-password": {
            Alert.alert("Wrong password... mate");
            break;
          }
          case "auth/weak-password": {
            Alert.alert("Password should be 6 characters or more.");
            break;
          }
          default: {
            alert(error.message);
            console.log(error.message);
          }
        }
      });
      const user = userCredentials.user;

      setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
      });

      console.log("user", user);

      // const auth = getAuth();
      // updateProfile(auth.currentUser, {
      //     displayName: fullName
      // })

      emptyState();
      setLoading(false);
      navigation.navigate("Dashboard");
    } catch (error) {
      setLoading(false);

      switch (error.code) {
        case "auth/invalid-email": {
          Alert.alert("Invalid email!");
          break;
        }
        case "auth/user-disabled": {
          Alert.alert("This user has been disabled!");
          break;
        }
        case "auth/user-not-found": {
          Alert.alert("This user doesn't exist");
          break;
        }
        case "auth/wrong-password": {
          Alert.alert("Wrong password... mate");
          break;
        }
        default: {
          console.log(error.message);
        }
      }
      //   console.error("Error signing up: ", error);
    }
  };

  return (
    <Box safeArea w='100%' h='100%' alignItems={'center'}>

    <VStack space={7} mt={10} w={"90%"} alignItems='center' >
      <Text fontSize={30} >SIGN UP</Text>
      <Input
              variant="rounded"
              placeholder="Name"
              placeholderTextColor={"#A4A4A4"}
              style={{ color: "#000" }}
              selectionColor={"white"}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
            <Input
              variant="rounded"
              placeholder="Email"
              placeholderTextColor={"#A4A4A4"}
              style={{ color: "#000" }}
              selectionColor={"white"}
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
            />
            <Input
              type={"password"}
              // type={'password'}
              InputLeftElement={
                <Icon
                  as={
                    <Icons
                      type="material-community"
                      name="lock"
                      color={"#A1A1A1"}
                    />
                  }
                  size="md"
                  m={2}
                  color={"white"}
                />
              }
              variant="rounded"
              placeholder="Password"
              placeholderTextColor={"#A4A4A4"}
              style={{ color: "#000" }}
              selectionColor={"white"}
              value={password}
              onChangeText={setPassword}
              autoCorrect={false}
            />
            <Input
              type={"password"}
              // type={'password'}
              InputLeftElement={
                <Icon
                  as={
                    <Icons
                      type="material-community"
                      name="lock"
                      color={"#A1A1A1"}
                    />
                  }
                  size="md"
                  m={2}
                  color={"white"}
                />
              }
              variant="rounded"
              placeholder="Confirm Password"
              placeholderTextColor={"#A4A4A4"}
              style={{ color: "#000" }}
              selectionColor={"white"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCorrect={false}
            />
            <Button
              w="100%"
              onPress={handleSignUp}
              //   isLoading={loading}
              //   isDisabled={loading}
            >
              SIGN UP
            </Button>
  
            <Box w='100%'>
            <Text onPress={() => navigation.navigate('SignIn')}>HAVE AN ACCOUNT?</Text>
            </Box>
            
          </VStack>
          </Box>
  )
}

export default SignUp