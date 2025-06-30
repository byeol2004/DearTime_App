
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const FloatingFAB = ({ isSaving }) => {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.fabContainer}>
      {showFabMenu && (
        <>
          <TouchableOpacity
  style={styles.fabButton}
  onPress={() => { navigation.navigate('HelpSupportScreen'); setShowFabMenu(false); }}
  disabled={isSaving}
>
  <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
</TouchableOpacity>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => { navigation.navigate('SettingScreen'); setShowFabMenu(false); }}
            disabled={isSaving}
          >
            <Ionicons name="settings" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => { navigation.navigate('DashboardScreen'); setShowFabMenu(false); }}
            disabled={isSaving}
          >
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        style={[styles.fabButton, styles.fabToggle]}
        onPress={() => setShowFabMenu(!showFabMenu)}
        disabled={isSaving}
      >
        <Ionicons
          name={showFabMenu ? 'close' : 'add'}
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 30, 
    right: 30,  
    alignItems: 'flex-end', 
    zIndex: 10, 
  },
  fabButton: {
    backgroundColor: '#86C0CC', 
    width: 50,
    height: 50,
    borderRadius: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A0BCC9', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 10, 
  },
  fabToggle: { 
      width: 60,
      height: 60,
      borderRadius: 30, 
      marginBottom: 0, 
  },
});

export default FloatingFAB;