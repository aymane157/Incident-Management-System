package com.entreprise.incidentmanagement.config;

import com.entreprise.incidentmanagement.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/incidents/FindNewIncident/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/attachments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/teams/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/client").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/*/claim/*").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/*/rejectIncidentWithReason").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/*/rejectIncidentByManager").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/*/reviewIncidentRejection").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/*/reopenRejectedIncident/*").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/incidents/**").hasAnyRole("CLIENT", "INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/incidents/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/incidents/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/rca-reports/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/rca-reports/*/client-rejection").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/notifications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/notifications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

