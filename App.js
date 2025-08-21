import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AddEventModal from './src/components/AddEventModal';
import EventDetailsModal from './src/components/EventDetailsModal'; 

// The base URL for the Django backend API, configured for the local network
const API_URL = 'http://192.168.1.99:8000/api/events/'; 

export default function App() {
  // Application state variables
  const [events, setEvents] = useState([]); 
  const [calendarDates, setCalendarDates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
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
          formattedDates[date].dots.push({ key: event.id, color: 'red' });
        } else {
          formattedDates[date] = {
            dots: [{ key: event.id, color: 'blue' }],
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
    setSelectedDay(day);
    const eventsForDay = events.filter(event => event.date === day.dateString);
    setSelectedDayEvents(eventsForDay);
    setIsDetailsModalVisible(true); 
  };

  // Callback to refresh events after a new event is successfully added
  const handleEventAddition = () => {
    getEvents();
  };

  // Handles the deletion of a specific event
  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${API_URL}${eventId}/`);
      Alert.alert("Success", "Event deleted successfully!");
      // Close the modal and refresh the events
      setIsDetailsModalVisible(false);
      getEvents(); 
    } catch (error) {
      console.error("Deletion Error:", error);
      Alert.alert("Error", "Failed to delete event. Please try again.");
    }
  };

  // Renders a loading indicator while data is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00adf5" />
      </View>
    );
  }

  // Main component render function
  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        markedDates={{
          ...calendarDates,
          ...(selectedDay ? { [selectedDay.dateString]: { ...calendarDates[selectedDay.dateString], selected: true, selectedColor: '#00adf5' } } : {}),
        }}
        markingType={'multi-dot'}
        onDayPress={handleDaySelection}
        theme={{
          todayTextColor: '#2d4150',
          selectedDayBackgroundColor: '#00adf5',
          arrowColor: '#00adf5',
          dotColor: '#00adf5'
        }}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsAddModalVisible(true)}>
          <Text style={styles.buttonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <AddEventModal
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onEventAdded={handleEventAddition}
      />

      <EventDetailsModal
        isVisible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        events={selectedDayEvents}
        selectedDate={selectedDay ? selectedDay.dateString : ''}
        onDeleteEvent={handleDeleteEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'center',
  },
  calendar: {
    width: '90%',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '90%',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#00adf5',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
