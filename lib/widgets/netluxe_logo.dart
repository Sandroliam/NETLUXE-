import 'package:flutter/material.dart';
import '../config/theme.dart';

class NetluxeLogo extends StatelessWidget {
  final double size;

  const NetluxeLogo({super.key, this.size = 60});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: AppTheme.red,
            borderRadius: BorderRadius.circular(size * 0.2),
            boxShadow: [
              BoxShadow(
                color: AppTheme.red.withOpacity(0.3),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Center(
            child: SizedBox(
              width: size * 0.6,
              height: size * 0.6,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: size * 0.25,
                        height: size * 0.25,
                        margin: EdgeInsets.all(size * 0.02),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(size * 0.05),
                        ),
                      ),
                      Container(
                        width: size * 0.25,
                        height: size * 0.25,
                        margin: EdgeInsets.all(size * 0.02),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(size * 0.05),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: size * 0.25,
                        height: size * 0.25,
                        margin: EdgeInsets.all(size * 0.02),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(size * 0.05),
                        ),
                      ),
                      Container(
                        width: size * 0.25,
                        height: size * 0.25,
                        margin: EdgeInsets.all(size * 0.02),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(size * 0.05),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'NET',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: size * 0.35,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Serif',
                ),
              ),
              TextSpan(
                text: 'LUXE',
                style: TextStyle(
                  color: AppTheme.red,
                  fontSize: size * 0.35,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Serif',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
