import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createDrawerNavigator } from '@react-navigation/drawer';

import {
  addMilestoneToFirestore,
  getMilestonesFromFirestore,
  updateDocumentInFirestore,
  deleteDocumentFromFirestore,
} from '../src/firestoreService';
import Sidebar from '../components/Sidebar';

const VERTICAL_SPACING = 200;

export default function MilestoneScreen() {
  const navigation = useNavigation();
  const Drawer = createDrawerNavigator();

  // --- State for the Form (in a modal) ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // --- State for Data and UI Control ---
  const [milestoneList, setMilestoneList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);


  const [searchText, setSearchText] = useState(''); 

  // --- Data Fetching ---
  const fetchMilestones = async () => {
    setIsLoading(true);
    try {
      const milestones = await getMilestonesFromFirestore();
      const sortedMilestones = milestones.sort(
        (a, b) => (b.date?.toDate() || 0) - (a.date?.toDate() || 0)
      );
      setMilestoneList(sortedMilestones);
    } catch (error) {
      Alert.alert('Error', 'Failed to load milestones.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMilestones(); }, []));

  // --- Handlers for Form, Save, Delete ---
  const onDateChange = (event, date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const handleSaveMilestone = async () => {
    if (title.trim() === '') {
      Alert.alert('Hold on!', 'Please enter a valid title and select a date.');
      return;
    }
    setIsSaving(true);
    try {
      const milestoneData = { title: title.trim(), description: description.trim(), date: selectedDate };
      if (editingMilestone) {
        await updateDocumentInFirestore('milestones', editingMilestone.id, milestoneData);
      } else {
        await addMilestoneToFirestore(title, selectedDate, description);
      }
      setFormModalVisible(false); resetForm(); fetchMilestones();
    } catch (error) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMilestone = (milestoneId) => {
    Alert.alert('Delete Milestone', 'Are you sure you want to permanently delete this milestone?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          setIsSaving(true);
          try {
            await deleteDocumentFromFirestore('milestones', milestoneId);
            setFormModalVisible(false); resetForm(); fetchMilestones();
          } catch (error) {
            Alert.alert('Delete Failed', error.message);
          } finally {
            setIsSaving(false);
          }
        }},
    ]);
  };

  // --- Functions to control the form modal ---
  const openNewMilestoneForm = () => { resetForm(); setFormModalVisible(true); };
  const openEditMilestoneForm = (milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description || '');
    setSelectedDate(milestone.date?.toDate() || new Date());
    setFormModalVisible(true);
  };
  const resetForm = () => {
    setEditingMilestone(null); setTitle(''); setDescription(''); setSelectedDate(new Date()); Keyboard.dismiss();
  };

  // --- Filtered Milestones for Search --- 
  const filteredMilestones = milestoneList.filter(m =>
    m.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const mapHeight = filteredMilestones.length * VERTICAL_SPACING + 200; 

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>My Timeline</Text>

      {/* Search Bar  */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search milestones..."
        placeholderTextColor="#87c0cd"
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        style={{ position: 'absolute', top: 30, left: 15, zIndex: 100 }}
        onPress={() => navigation.openDrawer()}
      >
        <MaterialIcons name="menu" size={32} color="#006a7a" />
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator style={{flex: 1}} size="large" color="#7ed6df" />
      ) : filteredMilestones.length === 0 ? ( 
         <View style={styles.emptyContainer}>
            <MaterialIcons name="timeline" size={80} color="#a0d8de" />
            <Text style={styles.emptyText}>Your timeline is clear.</Text>
            <Text style={styles.emptySubText}>Add a milestone to begin your professional journey.</Text>
         </View>
      ) : (
        <ScrollView contentContainerStyle={{height: mapHeight, width: '100%'}}>
         
            <View style={styles.timelineLine} />

            {filteredMilestones.map((item, index) => {
                const isRightSide = index % 2 === 0;
                const cardTopPosition = index * VERTICAL_SPACING + 50;
                return (
                    <View key={item.id} style={{top: cardTopPosition, width: '100%', position: 'absolute'}}>
                      
                        <View style={styles.timelineNode} />
                        <View style={[styles.connectorLine, isRightSide ? styles.connectorRight : styles.connectorLeft]} />

                        {/* Milestone Card */}
                        <TouchableOpacity 
                            style={[styles.cardContainer, isRightSide ? styles.cardRight : styles.cardLeft]}
                            onPress={() => openEditMilestoneForm(item)}
                        >
                            <Text style={styles.cardDate}>{item.date?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
                        </TouchableOpacity>
                    </View>
                );
            })}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={openNewMilestoneForm}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal visible={formModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFormModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => {setFormModalVisible(false); resetForm();}}>
              <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editingMilestone ? 'Edit Milestone' : 'New Milestone'}</Text>
              
              <Text style={styles.label}>Title*</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.multilineInput]} multiline value={description} onChangeText={setDescription} />

              <Text style={styles.label}>Date*</Text>
<TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
  <Text>
    {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display="spinner"
    onChange={onDateChange}
    maximumDate={new Date()}
    themeVariant="light"
  />
)}
              <View style={styles.modalActionRow}>
                  {editingMilestone && (
                      <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={() => handleDeleteMilestone(editingMilestone.id)} disabled={isSaving}>
                        <MaterialIcons name="delete_outline" size={24} color="#E57373" />
                      </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSaveMilestone} disabled={isSaving}>
                      <Text style={styles.modalButtonText}>{isSaving ? 'Saving...' : 'Save Milestone'}</Text>
                  </TouchableOpacity>
              </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
     
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eafcff' },
  screenTitle: { fontSize: 32, fontWeight: '700', color: '#006a7a', textAlign: 'center', paddingVertical: 20 },

  searchBar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0f0f7',
    borderRadius: 25,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
    height: 44,
    elevation: 2,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 22, fontWeight: '600', color: '#87c0cd', marginTop: 20 },
  emptySubText: { fontSize: 16, color: '#a0d8de', marginTop: 10, textAlign: 'center' },
  timelineLine: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, backgroundColor: '#d0f0f7', transform: [{translateX: -1.5}] },
  timelineNode: { position: 'absolute', left: '50%', width: 16, height: 16, backgroundColor: '#87c0cd', borderRadius: 8, borderWidth: 3, borderColor: '#fff', transform: [{translateX: -8}], zIndex: 1 },
  connectorLine: { position: 'absolute', width: '38%', height: 2, backgroundColor: '#d0f0f7' },
  connectorLeft: { left: '12%', top: 7 },
  connectorRight: { right: '12%', top: 7 },
  cardContainer: { position: 'absolute', width: '45%', backgroundColor: '#fff', borderRadius: 8, padding: 15, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, transform: [{translateY: -50}] },
  cardLeft: { left: 0 },
  cardRight: { right: 0 },
  cardDate: { fontSize: 12, color: '#777', marginBottom: 5, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#004f5c', marginBottom: 5 },
  cardDescription: { fontSize: 14, color: '#333', lineHeight: 20 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#f39c12', justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: '#fff' },
  // Modal Styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: { backgroundColor: '#eafcff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 30, elevation: 10, borderTopWidth: 1, borderColor: '#d0f0f7' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#7ed6df', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d0f0f7', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  modalActionRow: { flexDirection: 'row', marginTop: 30, alignItems: 'center' },
  modalButton: { paddingVertical: 14, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#87c0cd', flex: 1, marginLeft: 10 },
  deleteButton: { borderColor: '#E57373', borderWidth: 2, width: 60, height: 50, borderRadius: 25 },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabledButton: { opacity: 0.5 },
});