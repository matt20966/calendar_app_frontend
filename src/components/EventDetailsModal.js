import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';

const EventDetailsModal = ({ isVisible, onClose, events, selectedDate, onDeleteEvent, onEditEvent }) => {
  if (!events || events.length === 0) {
    return (
      <Modal visible={isVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Events on {selectedDate}</Text>
            <Text style={styles.noEventsText}>No events found for this day.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const handleShareEvent = (event) => {
    // Construct a clean, readable email body using template literals
    const subject = `Event Reminder: ${event.title}`;
    const body = `Hi there,%0A%0AHere are the details for an upcoming event:%0A%0AEvent: ${event.title}%0ADate: ${event.date}%0ATime: ${event.time.substring(0, 5)}%0ADescription: ${event.description}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch(err => console.error('Failed to open email client:', err));
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Events on {selectedDate}</Text>
          <ScrollView style={styles.eventList}>
            {events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventTextContainer}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time.substring(0, 5)}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <View style={styles.buttonRow}>
                  {/* Edit Button */}
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => onEditEvent(event)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  {/* Share Button */}
                  <TouchableOpacity 
                    style={styles.shareButton} 
                    onPress={() => handleShareEvent(event)}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                  {/* Delete Button */}
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => onDeleteEvent(event.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventList: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  eventItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#00adf5',
    borderRadius: 10,
    padding: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noEventsText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default EventDetailsModal;
