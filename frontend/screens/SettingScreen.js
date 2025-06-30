import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../src/firebaseConfig'; 

const Container = styled.ScrollView`
  flex: 1;
  background-color: #f6fcfe;
  padding-top: 10px;
`;

const SectionWrapper = styled.View`
  margin-bottom: 28px;
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 26px;
  margin-bottom: 13px;
  margin-top: 38px;
`;

const SectionIcon = styled.View`
  justify-content: center;
  align-items: center;
  background-color: #e4f3f8;
  border-radius: 11px;
  width: 32px;
  height: 32px;
`;

const SectionTitle = styled.Text`
  font-size: 19px;
  font-weight: 700;
  color: #247085;
  margin-left: 13px;
`;

const Card = styled.View`
  background-color: #fff;
  margin: 0 16px 0 16px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0px 4px 12px rgba(135, 192, 205, 0.09);
  elevation: 3;
`;

const OptionRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 19px 22px;
  border-bottom-width: ${props => props.last ? '0px' : '1px'};
  border-bottom-color: #edf8fb;
  background-color: #fff;
`;

const OptionText = styled.Text`
  font-size: 16.2px;
  color: #305a63;
  margin-left: 18px;
  font-weight: 500;
`;

const DangerOptionRow = styled(OptionRow)`
  background-color: #fff5f5;
  border-left-width: 4px;
  border-left-color: #ea384e;
  border-radius: 0 0 18px 18px;
`;

const DangerOptionText = styled(OptionText)`
  color: #ca2133;
  font-weight: 600;
`;


export default function SettingsScreen({ navigation }) {
  const handleLogout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('rememberMe');
    navigation.replace('LogSignScreen');
  } catch (error) {
    console.log('Logout error:', error);
    
  }
};
  return (
    <Container>

 
      <SectionWrapper>
        <SectionHeaderRow>
          <SectionIcon>
            <Ionicons name="person-outline" size={20} color="#87C0CD" />
          </SectionIcon>
          <SectionTitle>Account Settings</SectionTitle>
        </SectionHeaderRow>
        <Card>
          <OptionRow activeOpacity={0.8}>
            <Ionicons name="create-outline" size={21} color="#7bc1ca" />
            <OptionText>Edit Profile</OptionText>
          </OptionRow>
          <OptionRow
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChangePasswordScreen')}
            last
          >
            <Ionicons name="lock-closed-outline" size={21} color="#7bc1ca" />
            <OptionText>Change Password</OptionText>
          </OptionRow>
        </Card>
      </SectionWrapper>

   
      <SectionWrapper>
        <SectionHeaderRow>
          <SectionIcon>
            <Ionicons name="shield-checkmark-outline" size={20} color="#87C0CD" />
          </SectionIcon>
          <SectionTitle>Privacy & Security</SectionTitle>
        </SectionHeaderRow>
        <Card>
          <DangerOptionRow
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DeleteAccountScreen')}
            last
          >
            <Ionicons name="trash-outline" size={21} color="#ea384e" />
            <DangerOptionText>Delete Account</DangerOptionText>
          </DangerOptionRow>
        </Card>
      </SectionWrapper>

 
      <SectionWrapper>
        <SectionHeaderRow>
          <SectionIcon>
            <Ionicons name="information-circle-outline" size={20} color="#87C0CD" />
          </SectionIcon>
          <SectionTitle>About & Legal</SectionTitle>
        </SectionHeaderRow>
        <Card>
          <OptionRow activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={21} color="#7bc1ca" />
            <OptionText>About DearTime</OptionText>
          </OptionRow>
          <OptionRow activeOpacity={0.8}
          last
          onPress={() => navigation.navigate('TermsScreen')}>
            <Ionicons name="document-text-outline" size={21} color="#7bc1ca" />
            <OptionText>Privacy Policy</OptionText>
          </OptionRow>
         <OptionRow
  activeOpacity={0.8}
  last
  onPress={() => navigation.navigate('TermsScreen')}
>
  <Ionicons name="clipboard-outline" size={21} color="#7bc1ca" />
  <OptionText>Terms & Conditions</OptionText>
</OptionRow>

        </Card>
      </SectionWrapper>
      <SectionWrapper>
  <SectionHeaderRow>
    <SectionIcon>
      <Ionicons name="log-out-outline" size={20} color="#ea384e" />
    </SectionIcon>
    <SectionTitle>Logout</SectionTitle>
  </SectionHeaderRow>
  <Card>
    <DangerOptionRow
      activeOpacity={0.9}
      onPress={handleLogout}
      last
    >
      <Ionicons name="log-out-outline" size={21} color="#ea384e" />
      <DangerOptionText>Log Out</DangerOptionText>
    </DangerOptionRow>
  </Card>
</SectionWrapper>
      
    </Container>
  );
}