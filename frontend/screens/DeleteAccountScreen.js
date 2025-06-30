import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { deleteUserAccount } from '../src/authUtils';

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: #f0fafd;
  padding: 20px;
`;

const Header = styled.View`
  margin-top: 50px;
  margin-bottom: 30px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #d32f2f;
  margin-top: 10px;
`;

const WarningContainer = styled.View`
  background-color: #ffebee;
  border-left-width: 4px;
  border-left-color: #d32f2f;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const WarningTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #d32f2f;
  margin-bottom: 8px;
`;

const WarningText = styled.Text`
  font-size: 14px;
  color: #666;
  line-height: 20px;
`;

const Form = styled.View`
  flex: 1;
`;

const InputContainer = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 16px;
  color: #305a63;
  margin-bottom: 8px;
  font-weight: 500;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #305a63;
  margin-left: 10px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
`;

const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #87C0CD;
  padding: 18px;
  border-radius: 12px;
  align-items: center;
  margin-right: 10px;
`;

const DeleteButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${props => props.disabled ? '#cccccc' : '#d32f2f'};
  padding: 18px;
  border-radius: 12px;
  align-items: center;
  margin-left: 10px;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

export default function DeleteAccountScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDeleteAccount = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm account deletion');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone and will permanently delete:\n• All your memories\n• All your wishes\n• All your milestones\n• All your mood boards\n• Your entire account',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    setLoading(true);
    
    try {
      const result = await deleteUserAccount(password);
      
      if (result.success) {
        Alert.alert(
          'Account Deleted', 
          'Your account has been permanently deleted. Thank you for using DearTime.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Multiple navigation options - Firebase auth state change will handle the rest
                try {
                  // Option 1: Try to reset to root
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'LogSignScreen' }], // Replace with your main screen
                    })
                  );
                } catch (error) {
                  console.log('Navigation reset failed, trying alternative:', error);
                  // Option 2: Just go back - Firebase auth state will handle logout
                  navigation.popToTop();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header>
        <Ionicons name="warning" size={40} color="#d32f2f" />
        <Title>Delete Account</Title>
      </Header>

      <WarningContainer>
        <WarningTitle>⚠️ Warning: This action is irreversible!</WarningTitle>
        <WarningText>
          Deleting your account will permanently remove all your data including memories, wishes, milestones, and mood boards. This action cannot be undone.
        </WarningText>
      </WarningContainer>

      <Form>
        <InputContainer>
          <Label>Enter your password to confirm</Label>
          <InputWrapper>
            <Ionicons name="lock-closed-outline" size={20} color="#d32f2f" />
            <Input
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#d32f2f" 
              />
            </TouchableOpacity>
          </InputWrapper>
        </InputContainer>

        <ButtonContainer>
          <CancelButton onPress={() => navigation.goBack()}>
            <ButtonText>Cancel</ButtonText>
          </CancelButton>
          
          <DeleteButton
            onPress={handleDeleteAccount}
            disabled={loading || !password.trim()}
          >
            <ButtonText>
              {loading ? 'Deleting...' : 'Delete Forever'}
            </ButtonText>
          </DeleteButton>
        </ButtonContainer>
      </Form>
    </Container>
  );
}