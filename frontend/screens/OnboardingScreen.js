import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 

const { width, height } = Dimensions.get('window');

const pages = [
  {
    key: '1',
    title: 'Welcome to DearTime!',
    subtitle: 'A safe place to store your memories and milestones.',
    image: require('../assets/images/ccc3.png'),
    imageStyle: { width: 380, height: 340 }, 
  },
  {
    key: '2',
    title: '“Reflect and Grow”',
    subtitle: 'Look back on your journey, celebrate progress, and feel inspired.',
    image: require('../assets/images/crystal8.png'),
    imageStyle: { width: 270, height: 300 }, 
  },
  {
    key: '3',
    title: 'Stay Grounded and Motivated',
    subtitle: 'Life goes on: your memories remind you how strong you are.',
    image: require('../assets/images/map1.png'),
    imageStyle: { width: 330, height: 270 }, 
  },
];

export default function OnboardingScreen({ navigation }) {
  const [pageIndex, setPageIndex] = useState(0);

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      navigation.replace('LogSignScreen');
    }
  };

  const handleSkip = () => {
    navigation.replace('LogSignScreen');
  };

  const { title, subtitle, image } = pages[pageIndex];

  return (
    <View style={styles.container}>
    
      <Image
  source={image}
  style={[styles.image, pages[pageIndex].imageStyle]} 
  resizeMode="contain"
/>

    
      <TouchableOpacity onPress={handleSkip} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>


      <View style={styles.dots}>
        {pages.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              pageIndex === idx && styles.activeDot,
            ]}
          />
        ))}
      </View>

     
      <TouchableOpacity onPress={handleNext} style={styles.buttonShadowContainer}>
        <LinearGradient
          colors={['#95D0DD', '#7AB8C6']} 
          start={{ x: 0.3, y: 0 }} 
          end={{ x: 0.7, y: 1 }}
          style={styles.buttonInner}
        >
          <Text style={styles.buttonText}>
            {pageIndex === pages.length - 1 ? 'Get Started ' : 'Next'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#F4F7F9', 
  },
  

  skip: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 3,
  },
  skipText: {
    fontSize: 16,
    color: '#80B0BF', 
    fontWeight: '500',
  },
  textContainer: { 
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 10,
    alignItems: 'center',
    width: width * 0.9,
    shadowColor: '#DCE7F0', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 5, 
    marginBottom: 20,
  },
  title: {
    fontSize: 26, 
    fontWeight: '700',
    color: '#3A7A8A', 
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, 
    color: '#6B9FAA', 
    textAlign: 'center',
    lineHeight: 22, 
    marginBottom: 25,
  },
  dots: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  dot: { 
    width: 9, 
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#CFE6EB', 
  },
  activeDot: { 
    backgroundColor: '#87c0cd', 
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  buttonShadowContainer: { 
    borderRadius: 25,
    shadowColor: '#76A9B6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6, 
    marginBottom: 30,
  },
  buttonInner: { 
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25, 
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width * 0.75,
  },
  buttonText: {
    color: '#FFFFFF', 
    fontSize: 16,
    fontWeight: '600',
  },
});