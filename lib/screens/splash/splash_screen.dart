import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/providers.dart';
import '../widgets/netluxe_logo.dart';
import 'login/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isLoggedIn) {
        Navigator.pushReplacementNamed(context, '/profile-select');
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const NetluxeLogo(size: 100),
            const SizedBox(height: 32),
            Text(
              'LE CINÉMA, SANS LIMITES',
              style: TextStyle(
                color: AppTheme.gold.withOpacity(0.8),
                fontSize: 14,
                letterSpacing: 3,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            SizedBox(
              width: 100,
              child: LinearProgressIndicator(
                value: 0.3,
                backgroundColor: AppTheme.surface,
                valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.red),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              child: Row(
                children: [
                  Text(
                    'PASSER',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_forward, color: AppTheme.red, size: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
