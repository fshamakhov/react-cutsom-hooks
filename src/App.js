import React, { useState, useEffect } from 'react';

const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

const ChatAPIFunction = () => {
  let friends = [];

  return {
    subscribeToFriendStatus: (friendID, handleStatusChange) => {
      const existingFriend = friends.find(f => f.id === friendID);
      let online;
      if (!existingFriend) {
        online = Math.random() > 0.5;
        const name = friendList.find(f => f.id === friendID).name;
        friends.push({
          id: friendID,
          statusChange: handleStatusChange,
          subscribed: true,
          name,
          online,
        });
      } else {
        online = existingFriend.online;
        existingFriend.subscribed = true;
      }
      handleStatusChange({ isOnline: online });
    },
    unsubscribeFromFriendStatus: (friendID, handleStatusChange) => {
      const friend = friends.find(f => f.id === friendID);
      friend.subscribed = false;
    },
    changeStatuses: () => {
      for (let friend of friends) {
        let online = true;
        if (Math.random() > 0.5) {
          online = false;
        }
        friend.online = online;
        if (friend.subscribed) friend.statusChange({ isOnline: online });
      }
    },
    printFriends: () => {
      return JSON.stringify(
        friends.map( f => ({ name: f.name, online: f.online })),
        undefined,
        2
      );
    }
  };
};

const ChatAPI = ChatAPIFunction();

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    const name = friendList.find(f => f.id === friendID).name;
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}

function Circle(props) {
  return (
    <svg height="20" width="20">
      <circle cx="10" cy="10" r="8" stroke="black" strokeWidth="1" fill={props.color} />
      Sorry, your browser does not support inline SVG.  
    </svg> 
  )
}

export default function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const [friendsJSON, setFriendsJSON] = useState('');
  const isRecipientOnline = useFriendStatus(recipientID);

  useEffect(() => {
    setFriendsJSON(ChatAPI.printFriends());
  });

  return (
    <>
    <div style={{display: 'inline-flex'}}>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
      <button 
        style={{marginLeft: '5px'}}
        onClick={ChatAPI.changeStatuses}>
          Change Statuses
      </button>
    </div>
    <div>
      <pre>
        {friendsJSON}
      </pre>
    </div>
    </>
  );
}