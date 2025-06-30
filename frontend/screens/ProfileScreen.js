import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <LinearGradient colors={['#87c0cd', '#d5e8ed']} style={styles.header}>
        <View style={styles.profileCircle}></View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={20} color="#999" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Username"
            style={styles.textInput}
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="PASSWORD"
            style={styles.textInput}
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <MaterialIcons name="email" size={20} color="#999" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="EMAIL"
            style={styles.textInput}
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.loginText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.goButton} onPress={() => navigation.navigate('LogSignScreen')}>
          <Text style={styles.loginText}>Go to LogSign</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton}>
          <Ionicons name="home" size={24} color="#fff" />
          <Text style={styles.fabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fabButton}>
          <Ionicons name="grid-outline" size={24} color="#fff" />
          <Text style={styles.fabLabel}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fabButton}>
          <MaterialCommunityIcons name="image-album" size={24} color="#fff" />
          <Text style={styles.fabLabel}>Album</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafa' },
  header: {
    height: '35%',
    borderBottomRightRadius: 80,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  profileCircle: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#c1d2d7',
    position: 'absolute',
    bottom: -60,
    shadowColor: '#f9b4d0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  formContainer: {
    marginTop: 80,
    paddingHorizontal: 30,
    flex: 1,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
  },
  forgotText: {
    textAlign: 'right',
    color: '#aaa',
    marginBottom: 20,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#87c0cd',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#f98fb0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteButton: {
    backgroundColor: '#f2a7a7',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#ff6f91',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goButton: {
    backgroundColor: '#6da9b2',
    marginTop: 10,
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 4,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#87c0cd',
    paddingVertical: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: 30,
    marginTop: 20,
  },
  fabButton: {
    alignItems: 'center',
  },
  fabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});
