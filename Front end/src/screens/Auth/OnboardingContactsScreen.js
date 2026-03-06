import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../context/AuthContext';
import { addContact } from '../../services/authService';
import { COLORS } from '../../utils/constants';

const OnboardingContactsScreen = () => {
    const { completeOnboarding } = useContext(AuthContext);
    const [contacts, setContacts] = useState([
        { id: '1', name: '', phone: '', error: '' },
        { id: '2', name: '', phone: '', error: '' },
        { id: '3', name: '', phone: '', error: '' },
    ]);
    const [globalError, setGlobalError] = useState('');

    const updateContact = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        newContacts[index].error = ''; // Clear individual error on type
        setGlobalError(''); // Clear global error
        setContacts(newContacts);
    };

    const handleSave = async () => {
        let hasError = false;
        const phoneRegex = /^\d{10}$/;
        const newContacts = [...contacts];

        newContacts.forEach((contact, index) => {
            if (!contact.name.trim() || !contact.phone.trim()) {
                newContacts[index].error = 'Name and Phone required.';
                hasError = true;
            } else if (!phoneRegex.test(contact.phone)) {
                newContacts[index].error = 'Must be exactly 10 digits.';
                hasError = true;
            }
        });

        if (hasError) {
            setContacts(newContacts);
            setGlobalError('Please fix the errors above.');
            return;
        }

        // Check for duplicate numbers
        const phones = newContacts.map(c => c.phone);
        const uniquePhones = new Set(phones);
        if (uniquePhones.size !== 3) {
            setGlobalError('Each emergency contact must have a unique phone number.');
            return;
        }

        // Success - Save contacts to database then complete onboarding
        try {
            await Promise.all(newContacts.map(c => addContact(c.name, c.phone, 'Guardian')));
            completeOnboarding(newContacts);
        } catch (error) {
            setGlobalError('Failed to sync contacts securely. Check connection.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Icon name="shield" size={40} color={COLORS.primary} />
                    <Text style={styles.title}>Safety First</Text>
                    <Text style={styles.subtitle}>
                        DEFENSOR requires you to setup exactly 3 emergency contacts before continuing. These contacts will receive your live location if you trigger an SOS.
                    </Text>
                </View>

                {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

                {contacts.map((contact, index) => (
                    <View key={contact.id} style={styles.contactCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Guardian {index + 1}</Text>
                            {contact.error ? <Text style={styles.fieldError}>{contact.error}</Text> : null}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.textSecondary}
                            value={contact.name}
                            onChangeText={(text) => updateContact(index, 'name', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (10 digits)"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={contact.phone}
                            onChangeText={(text) => updateContact(index, 'phone', text)}
                        />
                    </View>
                ))}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Secure Guardians & Continue</Text>
                    <Icon name="arrow-right" size={20} color="#fff" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        marginTop: 15,
        marginBottom: 10,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    globalError: {
        color: COLORS.primary,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        padding: 10,
        borderRadius: 8,
    },
    contactCard: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        color: COLORS.safe,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    fieldError: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OnboardingContactsScreen;
