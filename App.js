import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AddEventModal from './src/components/AddEventModal';
import EditEventModal from './src/components/EditEventModal'; 

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// The base URL for the Django backend API, configured for the local network
const API_URL = 'http://192.168.1.99:8000/api/events/'; 

export default function App() {
  // Application state variables
  const [events, setEvents] = useState([]); 
  const [calendarDates, setCalendarDates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State for edit modal
  const [selectedEvent, setSelectedEvent] = useState(null); // State for event to be edited
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedDayEvents, setSelectedDayEvents] = useState([]); 

  // Fetches events from the API and formats them for the calendar
  const getEvents = async () => {
    try {
      const response = await axios.get(API_URL);
      const fetchedEvents = response.data;
      setEvents(fetchedEvents); 

      const formattedDates = {};
      fetchedEvents.forEach(event => {
        const date = event.date;
        if (formattedDates[date]) {
          // If a date already has events, add another dot
          formattedDates[date].dots.push({ key: event.id, color: 'white' });
        } else {
          // Otherwise, create a new entry for the date
          formattedDates[date] = {
            dots: [{ key: event.id, color: 'white' }],
            selected: false,
            selectedColor: 'transparent',
          };
        }
      });
      setCalendarDates(formattedDates);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setIsLoading(false);
    }
  };

  // Effect hook to run the initial data fetch on component mount
  useEffect(() => {
    getEvents();
  }, []);

  // Handles a day press on the calendar to show event details
  const handleDaySelection = (day) => {
    // Animate the layout change smoothly
    LayoutAnimation.easeInEaseOut();
    setSelectedDay(day);
    // Filter events for the selected day and update state
    const eventsForDay = events.filter(event => event.date === day.dateString);
    setSelectedDayEvents(eventsForDay);
  };

  // Callback to refresh events after a new event is successfully added or updated
  const handleEventAddition = () => {
    getEvents();
  };

  // Function to open the edit modal
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditModalVisible(true);
  };

  // Handles the deletion of a specific event
  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${API_URL}${eventId}/`);
      Alert.alert("Success", "Event deleted successfully!");
      // Refresh the events to update the UI
      getEvents(); 
      // Also update the list of selected day's events
      setSelectedDayEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error("Deletion Error:", error);
      Alert.alert("Error", "Failed to delete event. Please try again.");
    }
  };

  // Renders a loading indicator while data is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a4a4a" />
      </View>
    );
  }

  // Main component render function
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Events</Text>
      <Calendar
        style={styles.calendar}
        markedDates={{
          ...calendarDates,
          ...(selectedDay ? { [selectedDay.dateString]: { ...calendarDates[selectedDay.dateString], selected: true } } : {}),
        }}
        markingType={'multi-dot'}
        onDayPress={handleDaySelection}
        theme={{
          // Customizing the calendar's look and feel
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4a4a4a',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2d4150',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#4a4a4a',
          selectedDotColor: '#ffffff',
          arrowColor: '#4a4a4a',
          monthTextColor: '#4a4a4a',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '400',
        }}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsAddModalVisible(true)}>
          <Text style={styles.buttonText}>Add New Event</Text>
        </TouchableOpacity>
      </View>
      
      {/* Scrollable list to show events for the selected day */}
      <ScrollView style={styles.eventListContainer} contentContainerStyle={styles.eventListContent}>
        {selectedDayEvents.length > 0 ? (
          selectedDayEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time.substring(0, 5)}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => handleEditEvent(event)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEvent(event.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>
            {selectedDay ? `No events for ${selectedDay.dateString}` : 'Select a day to view events'}
          </Text>
        )}
      </ScrollView>

      <AddEventModal
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onEventAdded={handleEventAddition}
      />

      <EditEventModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        event={selectedEvent}
        onEventUpdated={handleEventAddition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 20,
  },
  calendar: {
    width: '90%',
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '90%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4a4a4a',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  eventListContainer: {
    flex: 1,
    width: '90%',
    marginTop: 20,
    paddingHorizontal: 5,
  },
  eventListContent: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventDetails: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF', // A nice blue for edit
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noEventsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontStyle: 'italic',
  },
});
