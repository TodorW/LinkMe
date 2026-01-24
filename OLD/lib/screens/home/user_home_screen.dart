import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:linkme/core/firestore_service.dart';
import 'package:linkme/core/location_service.dart';
import 'package:linkme/screens/request/create_request_screen.dart';
import 'package:linkme/screens/map/help_radar_screen.dart';
import 'package:linkme/screens/chat/chat_screen.dart';
import 'package:linkme/screens/profile/profile_screen.dart';
import 'package:linkme/widgets/request_card.dart';
import 'package:linkme/widgets/volunteer_card.dart';

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  final LocationService _locationService = LocationService();
  int _selectedIndex = 0;
  Map<String, dynamic>? _userData;
  List<Map<String, dynamic>> _aiRecommendations = [];

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
      _loadAIRecommendations();
    }
  }

  Future<void> _loadAIRecommendations() async {
    if (_userData?['location'] != null) {
      final recommendations = await _firestoreService.getAIRecommendations(
        _userData!['uid'],
        List<String>.from(_userData!['focusAreas'] ?? []),
        _userData!['location'],
      );
      setState(() {
        _aiRecommendations = recommendations;
      });
    }
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dobrodošli, ${_userData?['name'] ?? 'Korisniče'}!',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Kako vam možemo pomoći danas?',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Quick Actions
          const Text(
            'Brze akcije',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _ActionButton(
                  icon: Icons.add_circle_outline,
                  label: 'Novi zahtjev',
                  color: const Color(0xFF00C853),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CreateRequestScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _ActionButton(
                  icon: Icons.map_outlined,
                  label: 'Help Radar',
                  color: const Color(0xFF2962FF),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const HelpRadarScreen(),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          // AI Recommendations
          if (_aiRecommendations.isNotEmpty) ...[
            const Text(
              'Preporučeni volonteri',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Naši AI algoritmi pronašli su najkompatibilnije volontere za vas',
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _aiRecommendations.length,
                itemBuilder: (context, index) {
                  final volunteer = _aiRecommendations[index];
                  return SizedBox(
                    width: 160,
                    child: VolunteerCard(
                      name: volunteer['name'],
                      rating: volunteer['rating']?.toDouble() ?? 5.0,
                      focusAreas: List<String>.from(volunteer['focusAreas'] ?? []),
                      compatibilityScore: volunteer['compatibilityScore'] ?? 0,
                      onTap: () {
                        // Show volunteer details
                      },
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
          ],
          // Active Requests
          const Text(
            'Vaši aktivni zahtjevi',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          StreamBuilder(
            stream: _firestoreService.getUserRequests(
              context.read<AuthService>().currentUser!.uid,
            ),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              
              final requests = snapshot.data!.docs;
              if (requests.isEmpty) {
                return const Card(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Icon(Icons.inbox, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'Nemate aktivnih zahtjeva',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Kreirajte svoj prvi zahtjev',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                );
              }
              
              return Column(
                children: requests.map((doc) {
                  final request = doc.data() as Map<String, dynamic>;
                  return RequestCard(
                    title: request['title'],
                    description: request['description'],
                    category: request['category'],
                    status: request['status'],
                    address: request['address'],
                    onTap: () {
                      // Navigate to request details
                    },
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
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
      _buildHomeTab(),
      _buildChatsTab(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('LinkMe'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: tabs[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Početna',
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

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(icon, size: 40, color: color),
              const SizedBox(height: 12),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}