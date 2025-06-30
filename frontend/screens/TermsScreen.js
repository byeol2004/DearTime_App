import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
  return (
    <LinearGradient
      colors={['#F0F8FA', '#E6F2F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={styles.text}>
            By using DearTime, you agree to the following terms:
            {'\n\n'}• You are responsible for the content you create and save.
            {'\n'}• Do not upload illegal, harmful, or offensive content.
            {'\n'}• We reserve the right to suspend or remove accounts that violate these terms.
            {'\n'}• We may update these terms as needed and will notify you of major changes.
          </Text>

          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.text}>
            We value your privacy. Here's how we handle your data:
            {'\n\n'}• We collect your name, email, and the memories you save.
            {'\n'}• Your content is private and visible only to you.
            {'\n'}• We do not sell or share your personal data with third parties.
            {'\n'}• You can delete your data or account at any time from the app settings.
            {'\n'}• Some anonymous data may be used to improve app features and performance.
          </Text>

          <Text style={styles.thankYou}>Thank you for using DearTime 💙</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#598EA0',
    marginBottom: 10,
    marginTop: 25,
  },
  text: {
    fontSize: 15,
    color: '#2C5F6B',
    lineHeight: 22,
    marginBottom: 10,
  },
  thankYou: {
    fontSize: 15,
    color: '#598EA0',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});
