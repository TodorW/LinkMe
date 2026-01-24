import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';  // <-- DODAJTE OVO
import 'package:linkme/screens/auth/login_screen.dart';
import 'package:linkme/screens/home/user_home_screen.dart';
import 'package:linkme/screens/home/volunteer_home_screen.dart';
import 'package:linkme/core/auth_service.dart';
import 'package:provider/provider.dart';
import 'package:linkme/screens/auth/role_selection_screen.dart';  // <-- DODAJTE OVO

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const LinkMeApp());
}

class LinkMeApp extends StatelessWidget {
  const LinkMeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthService>(
          create: (_) => AuthService(),  // <-- Eksplicitno navedite tip
        ),
        StreamProvider<User?>(
          create: (context) => context.read<AuthService>().authStateChanges,
          initialData: null,
        ),
      ],
      child: MaterialApp(
        title: 'LinkMe',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF00C853),
            primary: const Color(0xFF00C853),
            secondary: const Color(0xFF2962FF),
          ),
          useMaterial3: true,
          fontFamily: 'Inter',
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
            elevation: 0,
          ),
        ),
        home: const AuthWrapper(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<User?>(context);  // <-- Sada je User iz firebase_auth
    
    if (user == null) {
      return const LoginScreen();
    }
    
    return FutureBuilder<Map<String, dynamic>?>(
      future: context.read<AuthService>().getUserData(user.uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        
        final userData = snapshot.data;
        if (userData == null) {
          return RoleSelectionScreen(
            email: '',
            password: '',
            name: '',
            jmbg: '',
          );
        }
        
        final role = userData['role'] as String? ?? 'user';
        
        if (role == 'volunteer') {
          return const VolunteerHomeScreen();
        } else {
          return const UserHomeScreen();
        }
      },
    );
  }
}