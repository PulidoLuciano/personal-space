// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>> & Record<string, ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = SymbolViewProps['name'] | 'checklist' | 'list.bullet' | 'checkmark' | 'pencil' | 'trash' | 'archive' | 'eye' | 'eye.slash' | 'note.text' | 'timer' | 'play.fill' | 'stop.fill' | 'magnifyingglass' | 'xmark' | 'xmark.circle.fill' | 'waveform' | 'plus.circle' | 'exclamationmark.triangle' | 'arrow.2.circlepath' | 'checkmark.circle' | 'mappin' | 'calendar' | 'clock' | 'repeat';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.down': 'keyboard-arrow-down',
  'checklist': 'checklist',
  'list.bullet': 'format-list-bulleted',
  'checkmark': 'check',
  'plus': 'add',
  'pencil': 'edit',
  'trash': 'delete',
  'archive': 'archive',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'note.text': 'note',
  'timer': 'timer',
  'play.fill': 'play-arrow',
  'stop.fill': 'stop',
  'magnifyingglass': 'search',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'waveform': 'show-chart',
  'plus.circle': 'add-circle',
  'exclamationmark.triangle': 'warning',
  'arrow.2.circlepath': 'refresh',
  'checkmark.circle': 'check-circle',
  'mappin': 'location-on',
  'calendar': 'event',
  'clock': 'access-time',
  'repeat': 'repeat',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
