import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { changeUserPassword } from '../src/authUtils';

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
  color: #5a99a1;
  margin-top: 10px;
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

const Button = styled.TouchableOpacity`
  background-color: ${props => props.disabled ? '#cccccc' : '#87C0CD'};
  padding: 18px;
  border-radius: 12px;
  align-items: center;
  margin-top: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const PasswordRequirement = styled.Text`
  color: #666;
  font-size: 12px;
  margin-top: 5px;
  font-style: italic;
`;

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateInput = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateInput()) return;

    setLoading(true);
    
    try {
      const result = await changeUserPassword(currentPassword, newPassword);
      
      if (result.success) {
        Alert.alert('Success', result.message, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header>
        <Ionicons name="lock-closed" size={40} color="#87C0CD" />
        <Title>Change Password</Title>
      </Header>

      <Form>
        <InputContainer>
          <Label>Current Password</Label>
          <InputWrapper>
            <Ionicons name="lock-closed-outline" size={20} color="#87C0CD" />
            <Input
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#87C0CD" 
              />
            </TouchableOpacity>
          </InputWrapper>
        </InputContainer>

        <InputContainer>
          <Label>New Password</Label>
          <InputWrapper>
            <Ionicons name="key-outline" size={20} color="#87C0CD" />
            <Input
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#87C0CD" 
              />
            </TouchableOpacity>
          </InputWrapper>
          <PasswordRequirement>
            Password must be at least 6 characters long
          </PasswordRequirement>
        </InputContainer>

        <InputContainer>
          <Label>Confirm New Password</Label>
          <InputWrapper>
            <Ionicons name="checkmark-circle-outline" size={20} color="#87C0CD" />
            <Input
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#87C0CD" 
              />
            </TouchableOpacity>
          </InputWrapper>
        </InputContainer>

        <Button
          onPress={handleChangePassword}
          disabled={loading}
        >
          <ButtonText>
            {loading ? 'Updating Password...' : 'Update Password'}
          </ButtonText>
        </Button>
      </Form>
    </Container>
  );
}