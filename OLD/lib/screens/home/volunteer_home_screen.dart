import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:linkme/core/firestore_service.dart';
import 'package:linkme/core/location_service.dart';
import 'package:linkme/screens/map/help_radar_screen.dart';
import 'package:linkme/screens/chat/chat_screen.dart';
import 'package:linkme/screens/profile/profile_screen.dart';
import 'package:linkme/widgets/request_card.dart';

class VolunteerHomeScreen extends StatefulWidget {
  const VolunteerHomeScreen({super.key});

  @override
  State<VolunteerHomeScreen> createState() => _VolunteerHomeScreenState();
}

class _VolunteerHomeScreenState extends State<VolunteerHomeScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final LocationService _locationService = LocationService();
  int _selectedIndex = 0;
  String _selectedCategory = 'Sve';
  Map<String, dynamic>? _userData;
  List<String> _categories = [
    'Sve',
    'Donošenje namirnica',
    'Čišćenje stana',
    'Fizička asistencija',
    'Pozajmljivanje alata',
  ];

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final authService = context.read<AuthService>();
    final user = authService.currentUser;
    if (user != null) {
      final data = await authService.getUserData(user.uid);
      setState(() {
        _userData = data;
      });
    }
  }

  Widget _buildRequestsTab() {
    return Column(
      children: [
        // Category Filter
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final category = _categories[index];
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(category),
                  selected: _selectedCategory == category,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = category;
                    });
                  },
                ),
              );
            },
          ),
        ),
        // Requests List
        Expanded(
          child: StreamBuilder(
            stream: _firestoreService.requests
                .where('status', isEqualTo: 'pending')
                .orderBy('createdAt', descending: true)
                .snapshots(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              
              final requests = snapshot.data!.docs;
              if (requests.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
                      SizedBox(height: 16),
                      Text(
                        'Nema aktivnih zahtjeva',
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Svi zahtjevi su obrađeni!',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                );
              }
              
              // Filter by category
              List filteredRequests = requests;
              if (_selectedCategory != 'Sve') {
                filteredRequests = requests.where((doc) {
                  final request = doc.data() as Map<String, dynamic>;
                  return request['category'] == _selectedCategory;
                }).toList();
              }
              
              // Filter by focus areas
              if (_userData?['focusAreas'] != null) {
                final focusAreas = List<String>.from(_userData!['focusAreas']);
                if (focusAreas.isNotEmpty) {
                  filteredRequests = filteredRequests.where((doc) {
                    final request = doc.data() as Map<String, dynamic>;
                    return focusAreas.contains(request['category']);
                  }).toList();
                }
              }
              
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: filteredRequests.length,
                itemBuilder: (context, index) {
                  final doc = filteredRequests[index];
                  final request = doc.data() as Map<String, dynamic>;
                  return RequestCard(
                    title: request['title'],
                    description: request['description'],
                    category: request['category'],
                    status: request['status'],
                    address: request['address'],
                    urgency: request['urgency'],
                    showAcceptButton: true,
                    onAccept: () async {
                      await _firestoreService.acceptRequest(
                        doc.id,
                        context.read<AuthService>().currentUser!.uid,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Prihvatili ste zahtjev')),
                      );
                    },
                    onTap: () {
                      // Show request details
                    },
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildChatsTab() {
    return StreamBuilder(
      stream: _firestoreService.getUserChats(
        context.read<AuthService>().currentUser!.uid,
      ),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        
        final chats = snapshot.data!.docs;
        if (chats.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'Nema poruka',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
              ],
            ),
          );
        }
        
        return ListView.builder(
          itemCount: chats.length,
          itemBuilder: (context, index) {
            final chat = chats[index].data() as Map<String, dynamic>;
            final participants = List<String>.from(chat['participants']);
            final currentUserId = context.read<AuthService>().currentUser!.uid;
            final otherUserId = participants.firstWhere(
              (id) => id != currentUserId,
            );
            final otherUserName = (chat['participantNames'] as Map<String, dynamic>)[otherUserId];
            
            return ListTile(
              leading: const CircleAvatar(
                child: Icon(Icons.person),
              ),
              title: Text(otherUserName ?? 'Korisnik'),
              subtitle: Text(chat['lastMessage'] ?? 'Nema poruka'),
              trailing: Text(
                _formatTime(chat['lastMessageTime']?.toDate()),
                style: const TextStyle(color: Colors.grey),
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ChatScreen(
                      chatId: chat['id'],
                      otherUserId: otherUserId,
                      otherUserName: otherUserName,
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  String _formatTime(DateTime? date) {
    if (date == null) return '';
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    }
    return 'Sada';
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      _buildRequestsTab(),
      _buildChatsTab(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('LinkMe Volonter'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.map_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const HelpRadarScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: tabs[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt),
            activeIcon: Icon(Icons.list),
            label: 'Zahtjevi',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat),
            label: 'Poruke',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}