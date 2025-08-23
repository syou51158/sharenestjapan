import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, I18nManager, Platform } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/services/i18n'; // i18n設定ファイル

// import { SampleButton } from '@sharenest/ui'; // 共通UIコンポーネントの例

// RTL言語対応 (アラビア語など) のための設定。日本語・中国語・英語では通常不要だが参考として
// if (Platform.OS !== 'web') {
//   try {
//     // Expo GoではI18nManager.forceRTLは動作しないことがある
//     // I18nManager.allowRTL(true);
//     // I18nManager.forceRTL(i18n.dir() === 'rtl');
//   } catch (e) {
//     console.error('Failed to set RTL layout', e);
//   }
// }

const MainApp = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18nInstance.changeLanguage(lng);
    // RTL言語の場合、レイアウトの再描画が必要な場合がある
    // if (Platform.OS !== 'web') {
    //   try {
    //     I18nManager.forceRTL(i18nInstance.dir(lng) === 'rtl');
    //     // アプリの再起動を促すか、RNRestartなどのライブラリで再起動
    //     // Updates.reloadAsync(); // Expo Updates API (Bare workflow or EAS build)
    //   } catch (e) {
    //     console.error('Failed to force RTL on language change', e);
    //   }
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcomeMessage')}</Text>
      <Text style={styles.subtitle}>{t('platformSubtitle')}</Text>
      {/* <SampleButton title={t('sampleButton')} onPress={() => alert('Button pressed!')} /> */}
      <View style={styles.langButtonContainer}>
        <Button title="日本語" onPress={() => changeLanguage('ja')} />
        <Button title="English" onPress={() => changeLanguage('en')} />
        <Button title="中文" onPress={() => changeLanguage('zh')} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <MainApp />
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  langButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
}); 