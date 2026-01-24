import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _userData;
  bool _isLoading = false;

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

  Future<void> _switchRole() async {
    final currentRole = _userData?['role'] ?? 'user';
    final newRole = currentRole == 'user' ? 'volunteer' : 'user';
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final authService = context.read<AuthService>();
      await authService.updateUserRole(
        authService.currentUser!.uid,
        newRole,
      );
      
      await _loadUserData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Uloga promijenjena u $newRole')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Odjava'),
        content: const Text('Da li ste sigurni da želite da se odjavite?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Otkaži'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<AuthService>().signOut();
            },
            child: const Text('Odjavi se'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final role = _userData?['role'] ?? 'user';
    final rating = _userData?['rating']?.toDouble() ?? 5.0;
    final totalRatings = _userData?['totalRatings'] ?? 0;
    
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF00C853),
                      const Color(0xFF2962FF),
                    ],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.white,
                      child: Icon(
                        Icons.person,
                        size: 60,
                        color: Color(0xFF00C853),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _userData?['name'] ?? 'Korisnik',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      _userData?['email'] ?? '',
                      style: const TextStyle(
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              // Stats Cards
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: _StatCard(
                        title: 'Ocjena',
                        value: rating.toStringAsFixed(1),
                        subtitle: '$totalRatings ocjena',
                        icon: Icons.star,
                        color: Colors.amber,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _StatCard(
                        title: 'Uloga',
                        value: role == 'user' ? 'Korisnik' : 'Volonter',
                        subtitle: role == 'user' 
                            ? 'Trebate pomoć' 
                            : 'Pružate pomoć',
                        icon: role == 'user' 
                            ? Icons.help 
                            : Icons.volunteer_activism,
                        color: role == 'user' 
                            ? Colors.blue 
                            : Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
              // Settings
              Card(
                margin: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.switch_account),
                      title: const Text('Promijeni ulogu'),
                      subtitle: Text(
                        role == 'user' 
                            ? 'Postanite volonter' 
                            : 'Postanite korisnik',
                      ),
                      trailing: _isLoading
                          ? const CircularProgressIndicator()
                          : const Icon(Icons.chevron_right),
                      onTap: _isLoading ? null : _switchRole,
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.category),
                      title: const Text('Oblasti pomoći'),
                      subtitle: const Text('Uredite vaše fokusne oblasti'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Navigate to focus areas screen
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.location_on),
                      title: const Text('Lokacija'),
                      subtitle: Text(_userData?['address'] ?? 'Nije postavljena'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Update location
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.notifications),
                      title: const Text('Notifikacije'),
                      subtitle: const Text('Upravljajte obavještenjima'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.security),
                      title: const Text('Privatnost i sigurnost'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: const Icon(Icons.help_center),
                      title: const Text('Pomoć i podrška'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {},
                    ),
                  ],
                ),
              ),
              // Logout Button
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: _logout,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Odjavi se'),
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ]),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}