class ChatModel {
  final String id;
  final List<String> participants;
  final Map<String, String> participantNames;
  final String requestId;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final DateTime createdAt;
  
  ChatModel({
    required this.id,
    required this.participants,
    required this.participantNames,
    required this.requestId,
    this.lastMessage,
    this.lastMessageTime,
    required this.createdAt,
  });
  
  factory ChatModel.fromMap(Map<String, dynamic> data) {
    return ChatModel(
      id: data['id'] ?? '',
      participants: List<String>.from(data['participants'] ?? []),
      participantNames: Map<String, String>.from(data['participantNames'] ?? {}),
      requestId: data['requestId'] ?? '',
      lastMessage: data['lastMessage'],
      lastMessageTime: (data['lastMessageTime'] as Timestamp?)?.toDate(),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }
}

class MessageModel {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final bool read;
  
  MessageModel({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    required this.read,
  });
  
  factory MessageModel.fromMap(Map<String, dynamic> data) {
    return MessageModel(
      id: data['id'] ?? '',
      senderId: data['senderId'] ?? '',
      text: data['text'] ?? '',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      read: data['read'] ?? false,
    );
  }
}