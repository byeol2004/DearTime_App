import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../src/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

export default function LogSignScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const [loadingAction, setLoadingAction] = useState(''); 

  const navigation = useNavigation();

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    setLoadingAction('login'); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      setLoadingAction(''); 
      Alert.alert('Login Successful');
      navigation.navigate('DashboardScreen');
      setEmail(''); setPassword('');
    } catch (error) {
      setLoading(false);
      setLoadingAction(''); 
      let errorMessage = 'Login Failed. Please try again.';
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email.';
      else if (error.code === 'auth/user-not-found') errorMessage = 'No user with this email.';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleSignup = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    if (firstName.trim() === '' || lastName.trim() === '' && !isLogin) {
      Alert.alert('Error', 'Please enter first and last name.');
      return;
    }
    setLoading(true);
    setLoadingAction('signup'); 
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      setLoadingAction(''); 
      Alert.alert('Signup Successful', 'Account created! Please log in.');
      setIsLogin(true);
      setEmail(''); setPassword(''); setFirstName(''); setLastName('');
    } catch (error) {
      setLoading(false);
      setLoadingAction(''); 
      let errorMessage = 'Signup Failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Email already in use.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email.';
      else if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak.';
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Forgot Password', 'Please enter your email address above first.');
      return;
    }
    setLoading(true);
    setLoadingAction('reset'); 
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setLoading(false);
      setLoadingAction(''); 
      Alert.alert('Check your email', 'A password reset link has been sent to your email.');
    } catch (error) {
      setLoading(false);
      setLoadingAction(''); 
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') errorMessage = 'No user found with this email.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email format.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#F0F8FA', '#E6F2F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullBackground}
    >
      <SafeAreaView style={styles.safeArea}>

      
        {loading && (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99,
          }}>
            <ActivityIndicator size="large" color="#87c0cd" />
            <Text style={{ color: '#fff', marginTop: 12, fontSize: 16 }}>
              {loadingAction === 'reset' && 'Sending reset email...'}
              {loadingAction === 'login' && 'Logging in...'}
              {loadingAction === 'signup' && 'Signing up...'}
            </Text>
          </View>
        )}
      

        <View style={styles.card}>
          <Image
            source={require('../assets/images/sign3.png')}
            style={styles.mascot}
            resizeMode="contain"
          />

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <InputWithIcon
                  icon="user"
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <InputWithIcon
                  icon="user"
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </>
            )}

            <InputWithIcon
              icon="envelope"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputWithIcon
              icon="lock"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            {isLogin && (
              <View style={styles.rememberContainer}>
                <Text style={styles.rememberText}>Remember Me</Text>
                <Switch
                  trackColor={{ false: "#CFDDE6", true: "#A0C5D0" }}
                  thumbColor={isLogin ? "#87c0cd" : "#EBF4F7"}
                  ios_backgroundColor="#CFDDE6"
                />
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={isLogin ? handleLogin : handleSignup}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const InputWithIcon = ({
  icon,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}) => (
  <View style={styles.inputContainer}>
    <FontAwesome name={icon} size={18} color={'#A0C5D0'} style={styles.inputIcon} />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#A0C5D0"
      secureTextEntry={secureTextEntry}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  fullBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#EBF4F7',
    borderRadius: 20,
    padding: 25,
    paddingTop: 70,
    shadowColor: '#DCE7F0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  mascot: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    position: 'absolute',
    top: -70,
    zIndex: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#DCEAF0',
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '80%',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#CFDDE6',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#87c0cd',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#598EA0',
  },
  toggleTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  form: {
  
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#CFDDE6',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#2C5F6B',
    fontSize: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  rememberText: {
    fontSize: 14,
    color: '#598EA0',
  },
  forgotText: {
    color: '#87c0cd',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#87c0cd',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
  },
  orText: {
    textAlign: 'center',
    color: '#598EA0',
    marginVertical: 18,
    fontSize: 14,
  },
  socialsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: '#DCEAF0',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#CFDDE6',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  dashboardButtonText: {
    color: '#598EA0',
    fontSize: 14,
    fontWeight: '500',
  },
});