import React, { useRef, useEffect, useState } from 'react';
import {
 View,
 Text,
 ScrollView,
 Image,
 TouchableOpacity,
 StyleSheet,
 Dimensions,
 Animated,
 Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingFAB from '../components/FloatingFAB';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
 const scrollRef = useRef();
 const [currentIndex, setCurrentIndex] = useState(0);
 const [showButtons, setShowButtons] = useState(false);
 const scaleAnim = useRef(new Animated.Value(1)).current;

 const features = [
 {
 id: 'addMemory',
 title: "Add Memory",
 subtitle: "Add photos, notes, dates, and locations",
 icon: "camera-outline",
 screen: "AddMemory",
 },
 {
 id: 'wishJar',
 title: "Wish Crystal Ball",
 subtitle: "Drop a Wish",
 icon: "gift-outline",
 screen: "WishJarScreen",
 },
 {
 id: 'milestone',
 title: "Track Milestone",
 subtitle: "Achievements",
 icon: "flag-outline",
 screen: "StoryScreen",
 },
 {
 id: 'pinMemory',
 title: "Pin Mood Memory",
 subtitle: "Mood Context",
 icon: "pin-outline",
 screen: "BoardScreen",
 },
 {
 id: 'joyJar',
 title: "Shake Joy Crystal Ball",
 subtitle: "Random Happiness",
 icon: "happy-outline",
 screen: "JoyJarScreen",
 },
 { 
 id: 'memoryAlbum',
 title: "Memory Album",
 subtitle: "Browse Your Photos",
 icon: "images-outline",
 screen: "MemoryAlbumScreen",
 },
 ];

 const carouselImages = [
 {
 id:1,
 title: 'Memory Storage',
 description: 'Keep your precious memories safe; add texts, photos, dates, and locations all in one place.',
 image: require('../assets/images/home2.png'), 
 },
 {
 id:2,
 title: 'Wish Crystal Ball',
 description: 'Write down your wishes and dreams. Come back anytime to see how they’ve grown or changed.',
 image: require('../assets/images/crystal1.png'), 
 },
 {
 id:3,
 title: 'Milestone Tracker',
 description: 'Track your achievements and life moments to see your progress and growth.',
 image: require('../assets/images/map3.png'), 
 },
  {
 id:4,
 title: 'Mood Memory Board',
 description: 'Pin memories based on how you feel: happy, grateful, or motivated.',
 image: require('../assets/images/board2.png'), 
 },
 {
 id:5,
 title: 'Joy Crystal Ball',
 description: 'Save happy memories and open the crystal ball anytime for a smile.',
 image: require('../assets/images/crystal4.png'), 
 },
 ];

 useEffect(() => {
 const interval = setInterval(() => {
 const nextIndex = (currentIndex +1) % carouselImages.length;
 if (scrollRef.current) {
 scrollRef.current.scrollTo({ x: nextIndex * width, animated: true });
 }
 setCurrentIndex(nextIndex);
 },4000);

 return () => clearInterval(interval);
 }, [currentIndex, carouselImages.length]);

 const handleFabPress = () => {
 setShowButtons(!showButtons);
 Animated.spring(scaleAnim, {
 toValue: showButtons ?1 :0.95,
 friction:4,
 useNativeDriver: true,
 }).start();
 };

 return (
 <View style={styles.container}>
 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:120 }}>
 <View style={styles.headerContainer}>
 <Text style={styles.headerTitle}>DearTime</Text>
 <Text style={styles.headerSubtitle}>Manage your memories</Text>
 </View>

 <ScrollView
 horizontal
 pagingEnabled
 showsHorizontalScrollIndicator={false}
 ref={scrollRef}
 snapToInterval={width}
 decelerationRate="fast"
 contentContainerStyle={styles.carouselOuterContainer}
 onMomentumScrollEnd={(event) => {
 const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
 setCurrentIndex(newIndex);
 }}
 >
 {carouselImages.map((item) => (
 <View key={item.id} style={styles.carouselCard}>
 <Text style={styles.carouselTitle}>{item.title}</Text>
 <Text style={styles.carouselDescription}>{item.description}</Text>
 <Image source={item.image} style={styles.carouselImage} />
 </View>
 ))}
 </ScrollView>

 <View style={styles.sectionHeader}>
 <Text style={styles.sectionTitle}>Features</Text>
 </View>

 <View style={styles.featuresGrid}>
 {features.map((feature) => (
 <TouchableOpacity
 key={feature.id}
 style={styles.featureCard}
 onPress={() => navigation.navigate(feature.screen)}
 >
 <Ionicons name={feature.icon} size={30} color="#86C0CC" />
 <Text style={styles.featureTitle}>{feature.title}</Text>
 <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
 </TouchableOpacity>
 ))}
 </View>
 </ScrollView>
<FloatingFAB/>

 </View>
 );
}

const styles = StyleSheet.create({
 container: {
 flex:1,
 backgroundColor: '#EBF5F7',
 },
 headerContainer: {
 paddingHorizontal:20,
 paddingTop: Platform.OS === 'android' ?40 :60,
 paddingBottom:20,
 },
 headerTitle: {
 fontSize:30,
 fontWeight: 'bold',
 color: '#5F8E9C',
 },
 headerSubtitle: {
 fontSize:18,
 color: '#86C0CC',
 },
 carouselOuterContainer: {
 paddingBottom:20,
 },
 carouselCard: {
 width: width *0.9,
 height:200,
 borderRadius:15,
 marginHorizontal: width *0.05,
 padding:20,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#ffffff',
 shadowColor: '#000',
 shadowOffset: { width:0, height:2 },
 shadowOpacity:0.1,
 shadowRadius:4,
 elevation:5,
 },
 carouselTitle: {
 fontSize:24,
 fontWeight: 'bold',
 color: '#5F8E9C',
 marginTop: 10,
 },
 carouselDescription: {
 fontSize:14,
 color: '#86C0CC',
 textAlign: 'center',
 marginTop: 5
 },
 carouselImage: {
 width:100,
 height:100,
 resizeMode: 'cover',
 borderRadius:10,
 marginTop: 10,
 },
 sectionHeader: {
 paddingHorizontal:20,
 marginTop:30,
 },
 sectionTitle: {
 fontSize:24,
 fontWeight: 'bold',
 color: '#5F8E9C',
 },
 featuresGrid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between',
 paddingHorizontal:20,
 },
 featureCard: {
 width: (width -50) /2,
 padding:20,
 borderRadius:15,
 marginBottom:20,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#ffffff',
 shadowColor: '#000',
 shadowOffset: { width:0, height:2 },
 shadowOpacity:0.1,
 shadowRadius:4,
 elevation:5,
 },
 featureTitle: {
 fontSize:16,
 fontWeight: 'bold',
 color: '#86C0CC',
 marginTop:10,
 },
 featureSubtitle: {
 fontSize:13,
 color: '#A0D2DB',
 },
 

});