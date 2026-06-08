import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

const profileImage = require('@/assets/images/profile.jpg');

const drawerItems = [
  { icon: 'search-outline', label: 'Home Search', routeName: 'index' },
  { icon: 'time-outline', label: 'Search History', routeName: 'history' },
  { icon: 'person-outline', label: 'Profile', routeName: 'profile' },
  { icon: 'log-out-outline', label: 'Sign Out', routeName: 'logout' },
] as const;

type AppDrawerContentProps = {
  navigation: {
    navigate: (routeName: string) => void;
  };
  state: {
    index: number;
    routes: { name: string }[];
  };
};

export function AppDrawerContent(props: AppDrawerContentProps) {
  const { currentUser } = useAuth();
  const { height, width } = useWindowDimensions();
  const activeRouteName = props.state.routes[props.state.index]?.name;
  const isCompactHeight = height < 660;
  const isNarrowDrawer = width < 380;
  const profileImageSize = isCompactHeight ? 56 : isNarrowDrawer ? 64 : 76;

  const navigateToRoute = (routeName: string) => {
    props.navigation.navigate(routeName);
  };

  return (
    <View className="flex-1 bg-card">
      <ScrollView contentContainerClassName="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        <View
          className={`relative overflow-hidden bg-primary px-5 ${
            isCompactHeight ? 'min-h-[138px] pb-4 pt-6' : 'min-h-[178px] pb-6 pt-9'
          }`}>
          <View className="absolute -left-12 -top-12 h-32 w-32 rotate-45 bg-accent opacity-45" />
          <View
            className={`absolute -right-12 -top-8 rotate-45 bg-accent opacity-45 ${
              isCompactHeight ? 'h-32 w-32' : 'h-44 w-44'
            }`}
          />
          <View className="absolute right-12 top-10 h-24 w-24 rotate-12 bg-white opacity-10" />
          <View
            className={`absolute -bottom-16 right-0 rotate-45 bg-accent opacity-30 ${
              isCompactHeight ? 'h-28 w-28' : 'h-40 w-40'
            }`}
          />

          <View
            className="overflow-hidden rounded-full border-4 border-white bg-white shadow-sm"
            style={{ height: profileImageSize, width: profileImageSize }}>
            <Image
              className="h-full w-full"
              resizeMode="cover"
              source={profileImage}
            />
          </View>
          <Text
            className={`font-black text-white ${
              isCompactHeight ? 'mt-2 text-lg' : 'mt-4 text-[22px]'
            }`}
            numberOfLines={1}>
            {currentUser?.fullName || 'LexiTech User'}
          </Text>
          <Text className="mt-0.5 text-xs font-bold text-white opacity-85" numberOfLines={1}>
            @{currentUser?.username || 'lexitech'} - LexiTech learner
          </Text>
        </View>

        <View className={`px-3 ${isCompactHeight ? 'gap-1 py-3' : 'gap-2 py-5'}`}>
          {drawerItems.map((item) => {
            const isActive = activeRouteName === item.routeName;

            return (
              <Pressable
                accessibilityRole="button"
                className={`flex-row items-center rounded-lg px-4 ${
                  isCompactHeight ? 'min-h-[42px] gap-3' : 'min-h-[48px] gap-4'
                } ${isActive ? 'bg-purple-50' : 'active:bg-indigo-50'}`}
                key={item.routeName}
                onPress={() => navigateToRoute(item.routeName)}>
                <Ionicons
                  color={isActive ? AppColors.primary : AppColors.textSecondary}
                  name={item.icon}
                  size={isCompactHeight ? 19 : 21}
                />
                <Text
                  className={`flex-1 font-extrabold ${
                    isNarrowDrawer || isCompactHeight ? 'text-sm' : 'text-[15px]'
                  } ${isActive ? 'text-primary' : 'text-text'}`}
                  numberOfLines={1}>
                  {item.label}
                </Text>
                {isActive ? <View className="h-2 w-2 rounded-full bg-accent" /> : null}
              </Pressable>
            );
          })}
        </View>

        <View
          className={`mx-5 mt-auto border-t border-gray-200 ${
            isCompactHeight ? 'pt-3' : 'pt-5'
          }`}>
          <View className={isCompactHeight ? 'gap-0' : 'gap-1'}>
            <View className="flex-row items-center gap-4 rounded-lg px-2 py-2.5">
              <Ionicons color={AppColors.textSecondary} name="share-social-outline" size={20} />
              <Text className="flex-1 text-sm font-bold text-text" numberOfLines={1}>
                Share LexiTech
              </Text>
            </View>
            <View className="flex-row items-center gap-4 rounded-lg px-2 py-2.5">
              <Ionicons color={AppColors.textSecondary} name="help-circle-outline" size={20} />
              <Text className="flex-1 text-sm font-bold text-text" numberOfLines={1}>
                Help and Feedback
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
