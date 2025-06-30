import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WavyAuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRememberMe(false);
  };

  const handleSubmit = () => {
    if (isLogin) {
      console.log('Logging in with:', email, password);
    } else {
      console.log('Signing up with:', firstName, lastName, email, password);
    }
  };

  const handleNext = () => {
    navigation.navigate('Questionnaire');
  };

  return (
    <LinearGradient
      colors={['#ff9ebd', '#f9b4d0']}
      style={styles.gradient}
    >
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <Svg height="200" width="100%" viewBox="0 0 1440 320" style={styles.wave}>
          <Path
            fill="#fff"
            d="M0,192 C240,96 480,288 720,192 C960,96 1200,288 1440,192 L1440,0 L0,0 Z"
          />
        </Svg>

        <View style={styles.switchToggle}>
          <TouchableOpacity
            style={[styles.switchButton, isLogin ? styles.activeSwitch : null]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={isLogin ? styles.activeText : styles.inactiveText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, !isLogin ? styles.activeSwitch : null]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={!isLogin ? styles.activeText : styles.inactiveText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.header}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>

          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
          </View>

          {isLogin && (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Text style={styles.checkboxBox}>
                  {rememberMe ? '✅' : '⬜'}
                </Text>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <Text style={styles.or}>OR</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialText}>📘 Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialText}>🟦 Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={toggleForm} style={styles.switchLink}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <Text style={styles.highlight}>
                {isLogin ? 'Sign Up' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          <Svg height="80" width="100%" viewBox="0 0 1440 320">
            <Path
              fill="#fff0f5"
              d="M0,64 C360,160 1080,0 1440,64 L1440,320 L0,320 Z"
            />
          </Svg>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    top: 0,
  },
  switchToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 140,
    width: '80%',
    elevation: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSwitch: {
    backgroundColor: '#ff7e9e',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#ff7e9e',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 25,
    padding: 24,
    marginTop: 20,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ff7e9e',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf1f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffc7d9',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#ff7e9e',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButton: {
    backgroundColor: '#ff7e9e',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  or: {
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 12,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    backgroundColor: '#fff6f8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ffd2df',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#777',
    fontSize: 14,
  },
  highlight: {
    color: '#ff7e9e',
    fontWeight: 'bold',
  },
  forgot: {
    color: '#ff7e9e',
    fontWeight: '600',
    textAlign: 'right',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    fontSize: 18,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
});
