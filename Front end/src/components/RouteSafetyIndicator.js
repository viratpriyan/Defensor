import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

const RouteSafetyIndicator = ({ score }) => {
    let indicatorConfig = {
        color: COLORS.safe,
        icon: '🟢',
        text: 'Safe Route'
    };

    if (score === 'Moderate') {
        indicatorConfig = { color: COLORS.warning, icon: '🟡', text: 'Moderate Traffic/Risk' };
    } else if (score === 'Risky') {
        indicatorConfig = { color: COLORS.primary, icon: '🔴', text: 'Risky Route - Caution' };
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Route Safety Score</Text>
            <View style={[styles.scoreBox, { borderColor: indicatorConfig.color, backgroundColor: indicatorConfig.color + '22' }]}>
                <Text style={styles.icon}>{indicatorConfig.icon}</Text>
                <Text style={[styles.text, { color: indicatorConfig.color }]}>{indicatorConfig.text}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    scoreBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1.5,
    },
    icon: {
        fontSize: 20,
        marginRight: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default RouteSafetyIndicator;
