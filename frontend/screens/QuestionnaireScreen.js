import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuestionnaireScreen({ navigation }) {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [answers, setAnswers] = useState(Array(15).fill(''));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  const people = ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Grandma', 'Grandpa', 'Love/Partner', 'Pet'];

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
  };

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < 14) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      animateSlide();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      animateSlide();
    }
  };

  const animateSlide = () => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSubmit = () => {
    console.log('Selected person:', selectedPerson);
    console.log('Answers:', answers);
  };

  const renderQuestions = () => (
    <Animated.View
      style={[
        styles.questionContainer,
        {
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.questionText}>
        Question {currentQuestionIndex + 1}: What does your {selectedPerson.toLowerCase()} always repeat?
      </Text>
      <TextInput
        style={styles.input}
        placeholder={`Answer for question ${currentQuestionIndex + 1}`}
        value={answers[currentQuestionIndex]}
        onChangeText={(text) => handleAnswerChange(currentQuestionIndex, text)}
      />
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#87c0cd', '#d5e8ed']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <TouchableOpacity style={styles.dashboardButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Questionnaire: Who are you remembering?</Text>

        {/* Person Selection */}
        <View style={styles.selectionContainer}>
          {people.map((person, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.selectionButton,
                selectedPerson === person && styles.selectedButton,
              ]}
              onPress={() => handleSelectPerson(person)}
            >
              <Text style={selectedPerson === person ? styles.selectedText : styles.selectionText}>
                {person}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Questions */}
        {selectedPerson ? (
          <View style={styles.questionsContainer}>
            <Text style={styles.subHeader}>Answer about {selectedPerson}:</Text>
            {renderQuestions()}
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
            {currentQuestionIndex === 14 && (
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit Answers</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.placeholderText}>Please select a person to start answering.</Text>
        )}
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
    paddingBottom: 40,
  },
  dashboardButton: {
    backgroundColor: '#6f9ea8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2a3e47',
    marginVertical: 20,
    textAlign: 'center',
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  selectionButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    margin: 6,
    borderWidth: 1,
    borderColor: '#568b99',
    elevation: 3,
  },
  selectedButton: {
    backgroundColor: '#568b99',
  },
  selectionText: {
    color: '#6a7b81',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  questionsContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2a3e47',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 17,
    color: '#6a7b81',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f0f8fa',
    padding: 12,
    borderRadius: 10,
    borderColor: '#c1d2d7',
    borderWidth: 1,
    fontSize: 16,
    width: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  navButton: {
    backgroundColor: '#6f9ea8',
    paddingVertical: 12,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  placeholderText: {
    fontSize: 18,
    color: '#4A7C59',
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
