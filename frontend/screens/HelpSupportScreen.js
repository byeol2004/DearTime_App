import React from "react";
import { Linking } from "react-native";
import styled from "styled-components/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, Feather } from '@expo/vector-icons';


const Container = styled.ScrollView`
  flex: 1;
  background-color: #f0fafd;
  padding: 0 0 24px 0;
`;


const Hero = styled(LinearGradient).attrs({
  colors: ["#a3d2ca", "#87C0CD"],
  start: {x: 0, y: 0.8},
  end: {x: 1, y: 0},
})`
  height: 155px;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 36px;
  border-bottom-right-radius: 36px;
  margin-bottom: 34px;
  flex-direction: row;
`;

const HeroIcon = styled.View`
  padding: 16px;
  border-radius: 120px;
  margin-right: -10px;
`;

const HeroText = styled.Text`
  color: #fff;
  font-size: 31px;
  font-weight: bold;
  letter-spacing: 1px;
`;


const SectionCard = styled.View`
  background-color: #fff;
  border-radius: 18px;
  padding: 18px 16px 8px 16px;
  margin: 0 18px 22px 18px;
  box-shadow: 0 2px 8px rgba(135, 192, 205, 0.11);
  elevation: 2;
`;


const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 7px;
`;

const SectionTitle = styled.Text`
  font-size: 19px;
  font-weight: 700;
  color: #3e6673;
  margin-left: 9px;
`;

const Paragraph = styled.Text`
  font-size: 15px;
  color: #2a4553;
  margin-bottom: 9px;
  line-height: 23px;
`;

const List = styled.View``;

const ListItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 3px;
`;

const Dot = styled.View`
  width: 7px;
  height: 7px;
  background-color: #87c0cd;
  border-radius: 4px;
  margin-top: 9px;
  margin-right: 8px;
`;

const LinkText = styled.Text`
  color: #1c7b92;
  font-weight: 600;
  text-decoration: underline;
  font-size: 15px;
`;

const DeveloperCard = styled.View`
  background-color: #d5f2f6;
  padding: 28px 19px 19px 19px;
  border-radius: 23px;
  align-items: center;
  margin: 0 18px 30px 18px;
  shadow-color: #87c0cd;
  shadow-opacity: 0.14;
  shadow-radius: 20px;
  elevation: 7;
  margin-top: 20px;
`;

const DevImageWrapper = styled.View`
  position: absolute;
  top: -43px;
  left: 0;
  right: 0;
  align-items: center;
`;

const DevImage = styled.Image`
  width: 85px;
  height: 85px;
  border-radius: 42.5px;
  border-width: 2.5px;
  border-color: #68b2be;
`;

const DevContent = styled.View`
  margin-top: 42px;
  align-items: center;
`;

const DevName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #22577a;
  margin-bottom: 3px;
`;

const DevDesc = styled.Text`
  font-size: 14px;
  color: #4b7b88;
  margin-bottom: 4px;
`;

const DevTagline = styled.Text`
  font-size: 15px;
  color: #55828b;
  font-style: italic;
  text-align: center;
  margin: 9px 0 14px 0;
`;

const SocialRow = styled.View`
  flex-direction: row;
  gap: 16px;
  margin-top: 3px;
`;

const IconButton = styled.TouchableOpacity`
  background-color: #fff;
  border-radius: 19px;
  padding: 10px 13px;
  elevation: 4;
  shadow-color: #60a99a;
  shadow-radius: 6px;
`;

export default function HelpAboutScreen() {
  return (
    <Container>
     
    <Hero>
  <HeroText>DearTime</HeroText>
</Hero>

     
      <SectionCard>
        <TitleRow>
          <Ionicons name="information-circle-outline" size={21} color="#86bec9" />
          <SectionTitle>About DearTime</SectionTitle>
        </TitleRow>
        <Paragraph>
          DearTime offers a safe and personal space for you to capture life’s journey. Document memories, set mindful goals, and track your emotional milestones to support your growth and wellbeing.
        </Paragraph>
      </SectionCard>

      
      <SectionCard>
        <TitleRow>
          <AntDesign name="questioncircleo" size={19} color="#86bec9" />
          <SectionTitle>How to Use</SectionTitle>
        </TitleRow>
        <List>
          <ListItem>
            <Dot />
            <Paragraph>
              Store moments with notes or photos in <Paragraph style={{fontWeight: 'bold'}}>Memory Storage</Paragraph>.
            </Paragraph>
          </ListItem>
          <ListItem>
            <Dot />
            <Paragraph>
              Add aspirations in the <Paragraph style={{fontWeight: 'bold'}}>Wish Crystal Ball</Paragraph>.
            </Paragraph>
          </ListItem>
          <ListItem>
            <Dot />
            <Paragraph>
              Track your achievements in the <Paragraph style={{fontWeight: 'bold'}}>Milestone Tracker</Paragraph>.
            </Paragraph>
          </ListItem>
          <ListItem>
            <Dot />
            <Paragraph>
              Pin your activities or moods of the Day in the <Paragraph style={{fontWeight: 'bold'}}>Mood Board</Paragraph>.
            </Paragraph>
          </ListItem>
          <ListItem>
            <Dot />
            <Paragraph>
              Shake the Crystal ball and look back to ur joyful moments in the <Paragraph style={{fontWeight: 'bold'}}>Joy Crystal Ball</Paragraph>.
            </Paragraph>
          </ListItem>
        </List>
      </SectionCard>

  
      <SectionCard>
        <TitleRow>
          <Feather name="mail" size={19} color="#86bec9" />
          <SectionTitle>Contact Support</SectionTitle>
        </TitleRow>
        <Paragraph>For help, feedback, or support, email us anytime:</Paragraph>
        <LinkText onPress={() => Linking.openURL('wc48376@gmail.com')}>
          wc48376@gmail.com
        </LinkText>
      </SectionCard>

    
      <DeveloperCard>
        <DevImageWrapper>
          <DevImage source={require('../assets/images/esther.jpg')} />
        </DevImageWrapper>
        <DevContent>
          <DevName>Esther</DevName>
          <DevDesc>Age 21 • MIT (BARS) Student</DevDesc>
          <DevTagline>
            “Crafting apps to capture little joys and big memories.”
          </DevTagline>
          <SocialRow>
            <IconButton onPress={() => Linking.openURL('https://www.instagram.com/orenji_esther?igsh=YTB0aTZ4bTZ3b3Z2')}>
              <AntDesign name="instagram" size={22} color="#90B8C2" />
            </IconButton>
            <IconButton onPress={() => Linking.openURL('https://github.com/byeol2004')}>
              <Feather name="github" size={22} color="#90B8C2" />
            </IconButton>
            <IconButton onPress={() => Linking.openURL('wc48376@gmail.com')}>
              <Ionicons name="mail-outline" size={22} color="#90B8C2" />
            </IconButton>
          </SocialRow>
        </DevContent>
      </DeveloperCard>
    </Container>
  );
}