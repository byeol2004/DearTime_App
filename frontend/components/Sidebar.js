import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Sidebar({ closeDrawer }) {
  const navigation = useNavigation();

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('DashboardScreen'); closeDrawer && closeDrawer(); }}>
        <MaterialIcons name="home" size={24} color="#006a7a" />
        <Text style={styles.menuText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('SettingScreen'); closeDrawer && closeDrawer(); }}>
        <MaterialIcons name="settings" size={24} color="#006a7a" />
        <Text style={styles.menuText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => { navigation.navigate('HelpSupportScreen'); closeDrawer && closeDrawer(); }}>
        <MaterialIcons name="help-outline" size={24} color="#006a7a" />
        <Text style={styles.menuText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#eafcff',
    paddingTop: 50,
    paddingHorizontal: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 14,
    color: '#006a7a',
    fontWeight: '600'
  }
});