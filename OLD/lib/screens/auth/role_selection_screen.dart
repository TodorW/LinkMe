import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:linkme/core/auth_service.dart';

class RoleSelectionScreen extends StatefulWidget {
  final String email;
  final String password;
  final String name;
  final String jmbg;
  
  const RoleSelectionScreen({
    super.key,
    required this.email,
    required this.password,
    required this.name,
    required this.jmbg,
  });

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  String? _selectedRole;
  final List<String> _selectedFocusAreas = [];
  bool _isLoading = false;
  
  final List<String> _focusAreas = [
    'Donošenje namirnica',
    'Čišćenje stana',
    'Fizička asistencija',
    'Pozajmljivanje alata',
    'Čuvanje djece',
    'Šetnja kućnih ljubimaca',
    'Pomoć u selidbi',
    'Popravka računara',
    'Vrtlarstvo',
    'Priprema obroka',
  ];

  Future<void> _completeRegistration() async {
    if (_selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Odaberite ulogu')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await context.read<AuthService>().registerWithEmail(
        email: widget.email,
        password: widget.password,
        jmbg: widget.jmbg,
        name: widget.name,
        role: _selectedRole!,
        focusAreas: _selectedRole == 'volunteer' ? _selectedFocusAreas : null,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška: $e')),
      );
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Odaberite ulogu'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            const Text(
              'Kako želite da pomognete?',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Odaberite vašu primarnu ulogu u aplikaciji',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 40),
            // Role Selection
            Row(
              children: [
                Expanded(
                  child: _RoleCard(
                    title: 'Trebam pomoć',
                    subtitle: 'Tražite pomoć u zajednici',
                    icon: Icons.help_outline,
                    isSelected: _selectedRole == 'user',
                    onTap: () => setState(() => _selectedRole = 'user'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _RoleCard(
                    title: 'Volonter',
                    subtitle: 'Pružate pomoć drugima',
                    icon: Icons.volunteer_activism,
                    isSelected: _selectedRole == 'volunteer',
                    onTap: () => setState(() => _selectedRole = 'volunteer'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            // Focus Areas for Volunteers
            if (_selectedRole == 'volunteer') ...[
              const Text(
                'Označite oblasti u kojima možete pomoći:',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _focusAreas.map((area) {
                  final isSelected = _selectedFocusAreas.contains(area);
                  return FilterChip(
                    label: Text(area),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedFocusAreas.add(area);
                        } else {
                          _selectedFocusAreas.remove(area);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              if (_selectedFocusAreas.isEmpty)
                Text(
                  'Odaberite barem jednu oblast',
                  style: TextStyle(
                    color: Colors.orange[700],
                    fontStyle: FontStyle.italic,
                  ),
                ),
            ],
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _completeRegistration,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C853),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Završi registraciju',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: isSelected ? 4 : 1,
      color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isSelected ? const Color(0xFF00C853) : Colors.grey[300]!,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(
                icon,
                size: 48,
                color: isSelected ? const Color(0xFF00C853) : Colors.grey,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? const Color(0xFF00C853) : Colors.black,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}