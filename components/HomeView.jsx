import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabHeader from "./TabHeader";
import ChatsView from "./tabs/ChatsView";
import StatusView from "./tabs/StatusView";
import CallsView from "./tabs/CallsView";

export default function TabLayout() {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "chats", title: "Chats" },
    { key: "status", title: "Status" },
    { key: "calls", title: "Calls" },
  ]);

  const renderScene = SceneMap({
    chats: ChatsView,
    status: StatusView,
    calls: CallsView,
  });

  const paddingTop = useSafeAreaInsets().top;
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition="top"
      style={{
        paddingTop: paddingTop,
      }}
      renderTabBar={() => (
        <TabHeader index={index} routes={routes} setIndex={setIndex} />
      )}
    />
  );
}
