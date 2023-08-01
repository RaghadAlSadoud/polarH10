import { Alert } from 'react-native'
import React,{useState} from 'react'
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

const SignIn = () => {
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const emptyState = () => {
    // setFullName("");
    setEmail("");
    setPassword("");
    // setConfirmPassword("");
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      emptyState();
      setLoading(false);
      navigation.navigate("Dashboard");
    } catch (error) {
      setLoading(false);
      if (!error) {
        console.log(error);
        return;
      }
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
    }
  };


  return (
    <Box safeArea w='100%' h='100%' alignItems={'center'}>

    <VStack space={7} mt={10} w={"90%"} alignItems='center' >
      <Text fontSize={30} >SIGN IN</Text>
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
            <Text>FORGOT PASSWORD?</Text>
            <Button
              w="100%"
              // onPress={handleSignIn}
              onPress={() => navigation.navigate('Dashboard')}
              //   isLoading={loading}
              //   isDisabled={loading}
            >
              SIGN IN
            </Button>

            <Box w='100%'>
            <Text onPress={() => navigation.navigate('SignUp')}>CREATE ACCOUNT</Text>
            </Box>
            
          </VStack>
          </Box>
  )
}

export default SignIn