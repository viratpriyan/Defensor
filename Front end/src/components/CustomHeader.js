import { useNavigation, useRoute } from '@react-navigation/native';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, ROUTES, SHADOWS } from '../utils/constants';

const CustomHeader = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Don't show the back button if we are on the Home dashboard
    const isHome = route.name === ROUTES.HOME;

    return (
        <View style={styles.headerContainer}>
            {/* Left Box: Back Button */}
            <View style={styles.sideBox}>
                {!isHome && (
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Icon name="chevron-left" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Center Box: Brand Logo */}
            <View style={styles.centerBox}>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.HOME)} style={styles.homeButton}>
                    <Icon name="shield" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.brandText}>DEFENSOR</Text>
                </TouchableOpacity>
            </View>

            {/* Right Box: Profile */}
            <View style={styles.sideBoxRight}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate(ROUTES.PROFILE)}
                >
                    <Icon name="user" size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.darkSurface,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20,
        ...SHADOWS.card,
    },
    sideBox: {
        width: 50,
        alignItems: 'flex-start',
    },
    sideBoxRight: {
        width: 50,
        alignItems: 'flex-end',
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    brandText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
    }
});

export default CustomHeader;
