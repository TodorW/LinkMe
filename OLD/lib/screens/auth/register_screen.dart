import 'package:flutter/material.dart';
import 'package:linkme/screens/auth/role_selection_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _nameController = TextEditingController();
  final _jmbgController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameController.dispose();
    _jmbgController.dispose();
    super.dispose();
  }

  bool _isValidJMBG(String jmbg) {
    if (jmbg.length != 13) return false;
    if (!RegExp(r'^\d+$').hasMatch(jmbg)) return false;
    
    // Basic JMBG validation (check digits)
    final digits = jmbg.split('').map(int.parse).toList();
    
    // Calculate check digit
    int a = 7 * (digits[0] + digits[6]) +
            6 * (digits[1] + digits[7]) +
            5 * (digits[2] + digits[8]) +
            4 * (digits[3] + digits[9]) +
            3 * (digits[4] + digits[10]) +
            2 * (digits[5] + digits[11]);
    
    int remainder = a % 11;
    int checkDigit = remainder == 0 ? 0 : 11 - remainder;
    
    return checkDigit == digits[12];
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() {
        _errorMessage = 'Lozinke se ne podudaraju';
      });
      return;
    }

    if (!_isValidJMBG(_jmbgController.text)) {
      setState(() {
        _errorMessage = 'Unesite validan JMBG (13 cifara)';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    // In real app, this would call AuthService
    // For now, navigate to role selection
    await Future.delayed(const Duration(seconds: 1));
    
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => RoleSelectionScreen(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          name: _nameController.text.trim(),
          jmbg: _jmbgController.text.trim(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registracija'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              const Text(
                'Kreirajte nalog',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Povežite se sa zajednicom',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 40),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Ime ili nadimak',
                        prefixIcon: Icon(Icons.person),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Unesite ime';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Unesite email';
                        }
                        if (!value.contains('@')) {
                          return 'Unesite validan email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _jmbgController,
                      decoration: const InputDecoration(
                        labelText: 'JMBG',
                        prefixIcon: Icon(Icons.badge),
                        border: OutlineInputBorder(),
                        helperText: 'Koristi se samo za verifikaciju',
                      ),
                      keyboardType: TextInputType.number,
                      maxLength: 13,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Unesite JMBG';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Lozinka',
                        prefixIcon: Icon(Icons.lock),
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Unesite lozinku';
                        }
                        if (value.length < 6) {
                          return 'Lozinka mora imati najmanje 6 karaktera';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _confirmPasswordController,
                      decoration: const InputDecoration(
                        labelText: 'Potvrdite lozinku',
                        prefixIcon: Icon(Icons.lock),
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                  ],
                ),
              ),
              if (_errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Text(
                    _errorMessage,
                    style: const TextStyle(
                      color: Colors.red,
                    ),
                  ),
                ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C853),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'Nastavi',
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
      ),
    );
  }
}