import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import ContactCard from '../../components/ContactCard';
import { addContact, deleteContact, getContacts, updateContact } from '../../services/authService';
import { COLORS, GRADIENTS, SHADOWS } from '../../utils/constants';

const EmergencyContactsScreen = ({ navigation }) => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingContactId, setEditingContactId] = useState(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const fetchContacts = async () => {
        try {
            setIsLoading(true);
            const res = await getContacts();
            if (res.success) {
                setContacts(res.data);
            }
        } catch (error) {
            console.error("Failed to load contacts", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchContacts();
        }, [])
    );

    const handleDelete = async (id) => {
        try {
            const res = await deleteContact(id);
            if (res.success) {
                setContacts(contacts.filter(c => c.id !== id));
            }
        } catch (error) {
            alert('Failed to delete contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContactId(contact.id);
        setName(contact.name);
        setPhone(contact.phone);
        setIsFormVisible(true);
    };

    const handleSave = async () => {
        if (!name || !phone) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            if (editingContactId) {
                // Update
                const res = await updateContact(editingContactId, name, phone, 'Family');
                if (res.success) {
                    setContacts(contacts.map(c => c.id === editingContactId ? res.data : c));
                }
            } else {
                // Add
                if (contacts.length >= 3) {
                    alert("Maximum 3 contacts allowed.");
                    return;
                }
                const res = await addContact(name, phone, 'Family');
                if (res.success) {
                    setContacts([...contacts, res.data]);
                }
            }
            resetForm();
        } catch (error) {
            alert('Failed to save contact');
        }
    };

    const resetForm = () => {
        setIsFormVisible(false);
        setEditingContactId(null);
        setName('');
        setPhone('');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <Text style={styles.title}>Guardians</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{contacts.length}/3</Text>
                </View>
            </View>

            <Text style={styles.subtitle}>
                These trusted contacts will be alerted immediately if you trigger an SOS.
            </Text>

            {isLoading ? (
                <View style={styles.loader}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            ) : (
                <View style={styles.contactsGrid}>
                    {[1, 2, 3].map((index) => {
                        const contact = contacts[index - 1];
                        return (
                            <View key={index} style={styles.contactSlot}>
                                <Text style={styles.slotLabel}>CONTACT {index}</Text>
                                {contact ? (
                                    <ContactCard
                                        contact={contact}
                                        onDelete={() => handleDelete(contact.id)}
                                        onEdit={() => handleEdit(contact)}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.emptySlot}
                                        onPress={() => {
                                            if (!isFormVisible) {
                                                setIsFormVisible(true);
                                                setEditingContactId(null);
                                            }
                                        }}
                                    >
                                        <View style={styles.addIconCircle}>
                                            <Icon name="user-plus" size={20} color={COLORS.textSecondary} />
                                        </View>
                                        <Text style={styles.addText}>Register Contact {index}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {isFormVisible && (
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>
                        {editingContactId ? "Edit Guardian" : "New Guardian"}
                    </Text>

                    <View style={styles.inputBox}>
                        <Icon name="user" size={18} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputBox}>
                        <Icon name="phone" size={18} color={COLORS.primary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.formActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtnWrapper} onPress={handleSave}>
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                style={styles.saveBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.saveBtnText}>
                                    {editingContactId ? "Update" : "Register"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 20 : 10,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.darkSurface,
    },
    countBadge: {
        backgroundColor: COLORS.darkSurface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 12,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 32,
        fontWeight: '500',
    },
    contactsGrid: {
        marginBottom: 24,
    },
    contactSlot: {
        marginBottom: 20,
    },
    slotLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.textSecondary,
        marginBottom: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    emptySlot: {
        height: 80,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        ...SHADOWS.card,
    },
    addIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    addText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    formCard: {
        backgroundColor: COLORS.surface,
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: COLORS.primary + '22',
        ...SHADOWS.card,
        marginTop: 10,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.darkSurface,
        marginBottom: 20,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.darkSurface,
        fontSize: 15,
        fontWeight: '600',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    cancelBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
        fontSize: 15,
    },
    saveBtnWrapper: {
        flex: 1,
        marginLeft: 10,
        ...SHADOWS.soft,
    },
    saveBtn: {
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: COLORS.white,
        fontWeight: '900',
        fontSize: 16,
    },
    loader: {
        padding: 40,
        alignItems: 'center',
    }
});

export default EmergencyContactsScreen;
